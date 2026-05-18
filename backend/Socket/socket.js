const { Server } = require("socket.io");
const http = require("http");
const express = require("express");

const app = express();

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST"],
    credentials: true
  }
});

const userSocketMap = {};

const getReciverSocketId = (reciverId) => {
  return userSocketMap[reciverId];
};

io.on("connection", (socket) => {

  const userId = socket.handshake.query.userId;

  if (userId && userId !== "undefined") {

    userSocketMap[userId] = socket.id;

    console.log(
      `User connected: ${userId}`
    );
  }

  io.emit(  "getOnlineUsers",Object.keys(userSocketMap));

  socket.on("disconnect", () => {

    console.log(
      `User disconnected: ${userId}`
    );

    delete userSocketMap[userId];

    io.emit("getOnlineUsers",Object.keys(userSocketMap));
     });

});

module.exports = {app,io,server,getReciverSocketId};