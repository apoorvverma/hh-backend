import express from 'express';
import { createServer } from 'http';
import { Server, Socket } from 'socket.io';

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: { origin: '*' }
});

type UserLocation = {
  userId: string;
  username: string;
  coords: { latitude: number; longitude: number };
  socketId: string;
};

let onlineUsers: Record<string, UserLocation> = {};

// Handle socket connections
io.on('connection', (socket: Socket) => {
  // User comes online and shares their info
  socket.on('user:online', (data: { userId: string; username: string; coords: { latitude: number; longitude: number } }) => {
    onlineUsers[socket.id] = {
      ...data,
      socketId: socket.id
    };
    // Notify all clients of the updated user list
    io.emit('users:update', Object.values(onlineUsers));
  });

  // User updates their location
  socket.on('user:move', (coords: { latitude: number; longitude: number }) => {
    if (onlineUsers[socket.id]) {
      onlineUsers[socket.id].coords = coords;
      io.emit('users:update', Object.values(onlineUsers));
    }
  });

  // User disconnects
  socket.on('disconnect', () => {
    delete onlineUsers[socket.id];
    io.emit('users:update', Object.values(onlineUsers));
  });
});

httpServer.listen(3000, () => {
  console.log('Server running on port 3000');
});
