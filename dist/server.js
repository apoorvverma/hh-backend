"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const http_1 = require("http");
const socket_io_1 = require("socket.io");
const app = (0, express_1.default)();
const httpServer = (0, http_1.createServer)(app);
const io = new socket_io_1.Server(httpServer, {
    cors: { origin: '*' }
});
let onlineUsers = {};
// Handle socket connections
io.on('connection', (socket) => {
    // User comes online and shares their info
    socket.on('user:online', (data) => {
        onlineUsers[socket.id] = {
            ...data,
            socketId: socket.id
        };
        // Notify all clients of the updated user list
        io.emit('users:update', Object.values(onlineUsers));
    });
    // User updates their location
    socket.on('user:move', (coords) => {
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
