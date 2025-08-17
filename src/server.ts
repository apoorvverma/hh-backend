// src/server.ts
import express from "express";
import http from "http";
import { Server } from "socket.io";
import dotenv from "dotenv";
import { getDistance } from "./utils/geoutils";

dotenv.config();
const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: { origin: process.env.FRONTEND_ORIGIN ?? "*", methods: ["GET", "POST"] }
});

// In-memory store of connected sockets
interface UserSocketData {
  userId: string;
  role: "driver" | "rider";
  lat: number;
  lng: number;
}
const connectedUsers = new Map<string, UserSocketData>();

// Radius in meters (default 5000 = 5 km)
const MATCH_RADIUS = Number(process.env.SOCKET_RADIUS) || 5000;

io.on("connection", (socket) => {
  console.log(`↔️  Socket connected: ${socket.id}`);

  // 1. Register the user (must be sent right after connecting)
  socket.on("user:register", (data: {
    userId: string;
    role: "driver" | "rider";
    lat: number;
    lng: number;
  }) => {
    const { userId, role, lat, lng } = data;
    connectedUsers.set(socket.id, { userId, role, lat, lng });
    // Join the opposite room so broadcasts go to riders ↔ drivers
    const targetRoom = role === "driver" ? "riders" : "drivers";
    socket.join(targetRoom);
  });

  // 2. On every location update: update store, then broadcast to nearby
  socket.on("location:update", (coords: { lat: number; lng: number }) => {
    const user = connectedUsers.get(socket.id);
    if (!user) return;

    user.lat = coords.lat;
    user.lng = coords.lng;

    // Broadcast this user’s new position to everyone of the opposite role
    const oppositeRole = user.role === "driver" ? "rider" : "driver";
    for (const [otherSocketId, other] of connectedUsers.entries()) {
      if (other.role !== oppositeRole) continue;

      const dist = getDistance(user.lat, user.lng, other.lat, other.lng);
      if (dist <= MATCH_RADIUS) {
        io.to(otherSocketId).emit("user:location", {
          userId: user.userId,
          lat:  user.lat,
          lng:  user.lng,
        });
      }
    }
  });

  socket.on("disconnect", () => {
    console.log(`❌ Socket disconnected: ${socket.id}`);
    connectedUsers.delete(socket.id);
  });
});

const PORT = process.env.PORT || 4000;
server.listen(PORT, () => {
  console.log(`🚀 Server listening on port ${PORT}`);
});
