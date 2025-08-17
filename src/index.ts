// src/index.ts
import express from "express";
import http from "http";
import { Server } from "socket.io";
import dotenv from "dotenv";
import routes from "./routes";
import { getDistance } from "./utils/geoutils";
import cors from "cors";
import { initSockets } from "./realtime/socket";

dotenv.config();

// ─── Express App ──────────────────────────────────────────────────────────────
const app = express();
app.use(cors());
app.use(express.json());
app.use(routes);

// ─── HTTP & Socket.IO Server ─────────────────────────────────────────────────
const server = http.createServer(app);
initSockets(server);

/* const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_ORIGIN ?? "*",
    methods: ["GET", "POST"],
  },
});

// ─── In-memory Socket Store ───────────────────────────────────────────────────
interface UserSocketData {
  userId: string;
  role: "driver" | "rider";
  lat: number;
  lng: number;
}
const connectedUsers = new Map<string, UserSocketData>();

// radius for “nearby” in meters (env override or default 5 km)
const MATCH_RADIUS = Number(process.env.SOCKET_RADIUS) || 5000;

// ─── Socket Handlers ─────────────────────────────────────────────────────────
io.on("connection", (socket) => {
  console.log(`↔️  Socket connected: ${socket.id}`);

  // 1) client must immediately register
  socket.on(
    "user:register",
    (data: { userId: string; role: "driver" | "rider"; lat: number; lng: number }) => {
      const { userId, role, lat, lng } = data;
      connectedUsers.set(socket.id, { userId, role, lat, lng });
      // join opposite-room: drivers → riders, riders → drivers
      const room = role === "driver" ? "riders" : "drivers";
      socket.join(room);
      console.log(`   ┗ Registered ${userId} as ${role}`);
    }
  );

  // 2) on location updates broadcast to nearby opposite-role sockets
  socket.on("location:update", (coords: { lat: number; lng: number }) => {
    const user = connectedUsers.get(socket.id);
    if (!user) return;

    user.lat = coords.lat;
    user.lng = coords.lng;

    const targetRole = user.role === "driver" ? "rider" : "driver";
    for (const [otherId, other] of connectedUsers.entries()) {
      if (other.role !== targetRole) continue;
      const dist = getDistance(user.lat, user.lng, other.lat, other.lng);
      if (dist <= MATCH_RADIUS) {
        io.to(otherId).emit("user:location", {
          userId: user.userId,
          lat: user.lat,
          lng: user.lng,
        });
      }
    }
  });

  socket.on("disconnect", () => {
    console.log(`❌ Socket disconnected: ${socket.id}`);
    connectedUsers.delete(socket.id);
  });
}); */

// ─── Start Server ────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 4000;
server.listen(PORT, () => {
  console.log(`🚀 Server listening on http://localhost:${PORT}`);
});
