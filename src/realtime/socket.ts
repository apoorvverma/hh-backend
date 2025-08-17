// src/realtime/socket.ts
import type { Server as HTTPServer } from "http";
import { Server, Socket } from "socket.io";
import { getDistance } from "../utils/geoutils";
import { db } from "../config/firebase";
import { createOnAccept, RideDoc } from "../models/ride.model";

type Role = "driver" | "rider";

export interface RegisterPayload {
  userId: string;
  role: Role;
  lat: number;
  lng: number;
}
export interface LocationPayload { lat: number; lng: number }

export interface OfferPayload {
  eventId: string;
  requestId: string;
  riderId: string;
  pickup: { lat: number; lng: number; address?: string };
  dropoff: { lat: number; lng: number; address?: string };
  distanceMeters: number;
}

export interface RideUpdatePayload {
  rideId: string;
  riderId: string;
  driverId: string;
  status: "ACCEPTED" | "IN_PROGRESS" | "COMPLETED" | "CANCELLED";
}

let io: Server | null = null;

// Socket presence stores
interface UserSocketData {
  userId: string;
  role: Role;
  lat: number;
  lng: number;
}
const socketsById = new Map<string, UserSocketData>();        // socket.id -> data
const socketsByUser = new Map<string, Set<string>>();         // userId   -> socket.id set

// Config
const MATCH_RADIUS = Number(process.env.SOCKET_RADIUS) || 5000; // meters
const TOP_N_DRIVERS = Number(process.env.SOCKET_TOPN) || 5;

export function initSockets(server: HTTPServer) {
  io = new Server(server, {
    cors: {
      origin: process.env.FRONTEND_ORIGIN ?? "*",
      methods: ["GET", "POST"],
    },
  });

  io.on("connection", (socket) => wireSocket(socket));
  return io;
}

export function getIO(): Server {
  if (!io) throw new Error("Socket.io not initialized");
  return io;
}

// ────────────────────────────────────────────────────────────────────────────────
// Public helpers to call from controllers
// ────────────────────────────────────────────────────────────────────────────────

/** Emit a ride update to both rider and driver clients */
export function notifyRideUpdate(update: RideUpdatePayload) {
  const { riderId, driverId, ...payload } = update;
  emitToUser(riderId, "ride:update", payload);
  emitToUser(driverId, "ride:update", payload);
}

/** Broadcast a new rider request to the nearest TOP_N drivers */
export function notifyDriversOfRequest(input: {
  requestId: string;
  riderId: string;
  pickup: { lat: number; lng: number; address?: string };
  dropoff: { lat: number; lng: number; address?: string };
}) {
  if (!io) return;
  const { requestId, riderId, pickup, dropoff } = input;

  // gather all online drivers and compute distances from pickup
  const candidates: Array<{ socketId: string; dist: number }> = [];
  for (const [sid, data] of socketsById) {
    if (data.role !== "driver") continue;
    const dist = getDistance(pickup.lat, pickup.lng, data.lat, data.lng);
    if (dist <= MATCH_RADIUS) candidates.push({ socketId: sid, dist });
  }
  candidates.sort((a, b) => a.dist - b.dist);

  const top = candidates.slice(0, TOP_N_DRIVERS);
  const eventId = typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : Math.random().toString(36).slice(2);

  for (const c of top) {
    const offer: OfferPayload = {
      eventId,
      requestId,
      riderId,
      pickup,
      dropoff,
      distanceMeters: Math.round(c.dist),
    };
    io.to(c.socketId).emit("request:offer", offer);
  }
}

// ────────────────────────────────────────────────────────────────────────────────
// Internal: socket lifecycle and events
// ────────────────────────────────────────────────────────────────────────────────

function wireSocket(socket: Socket) {
  console.log(`↔️  Socket connected: ${socket.id}`);

  socket.on("user:register", (data: RegisterPayload, ack?: (r: { ok: boolean }) => void) => {
    const { userId, role, lat, lng } = data || ({} as RegisterPayload);
    if (!userId || (role !== "driver" && role !== "rider")) {
      ack?.({ ok: false });
      return;
    }
    socketsById.set(socket.id, { userId, role, lat, lng });

    let set = socketsByUser.get(userId);
    if (!set) socketsByUser.set(userId, (set = new Set()));
    set.add(socket.id);

    // join opposite audience rooms if you want room-based fanout (optional)
    const room = role === "driver" ? "riders" : "drivers";
    socket.join(room);

    ack?.({ ok: true });
  });

  socket.on("location:update", (coords: LocationPayload) => {
    const user = socketsById.get(socket.id);
    if (!user) return;
    user.lat = coords.lat;
    user.lng = coords.lng;

    // broadcast to nearby opposite-role users
    const oppositeRole: Role = user.role === "driver" ? "rider" : "driver";
    for (const [otherSid, other] of socketsById.entries()) {
      if (other.role !== oppositeRole) continue;
      const dist = getDistance(user.lat, user.lng, other.lat, other.lng);
      if (dist <= MATCH_RADIUS) {
        io!.to(otherSid).emit("user:location", {
          userId: user.userId,
          lat: user.lat,
          lng: user.lng,
        });
      }
    }
  });

  /**
   * Optional: drivers can accept offers via socket too (pure realtime).
   * Frontend can still use the REST endpoint if you prefer.
   */
  socket.on(
    "request:accept",
    async (
      payload: { requestId: string; eventId?: string },
      ack?: (r: { ok: boolean; rideId?: string; error?: string }) => void
    ) => {
      try {
        const me = socketsById.get(socket.id);
        if (!me || me.role !== "driver") {
          ack?.({ ok: false, error: "Not a driver" });
          return;
        }

        const requestRef = db.collection("rideRequests").doc(payload.requestId);
        const txResult = await db.runTransaction(async (tx) => {
          const snap = await tx.get(requestRef);
          if (!snap.exists) throw new Error("Request not found");
          const cur = snap.data() as any;
          if (cur.status !== "REQUESTED") throw new Error("Request no longer available");
          tx.update(requestRef, { status: "EXPIRED" });
          return { riderId: cur.riderId, requestId: payload.requestId };
        });

        const ride = await createOnAccept({
          requestId: txResult.requestId,
          riderId: txResult.riderId,
          driverId: me.userId,
        });

        // notify both parties
        notifyRideUpdate({
          rideId: ride.id,
          riderId: ride.riderId,
          driverId: ride.driverId,
          status: "ACCEPTED",
        });

        ack?.({ ok: true, rideId: ride.id });
      } catch (e: any) {
        ack?.({ ok: false, error: e?.message || "accept failed" });
      }
    }
  );

  socket.on("disconnect", () => {
    const data = socketsById.get(socket.id);
    if (data) {
      const set = socketsByUser.get(data.userId);
      if (set) {
        set.delete(socket.id);
        if (set.size === 0) socketsByUser.delete(data.userId);
      }
    }
    socketsById.delete(socket.id);
    console.log(`❌ Socket disconnected: ${socket.id}`);
  });
}

// helper: emit to all of a user’s sockets
function emitToUser(userId: string, event: string, payload: any) {
  if (!io) return;
  const set = socketsByUser.get(userId);
  if (!set || set.size === 0) return;
  for (const sid of set) io.to(sid).emit(event, payload);
}
