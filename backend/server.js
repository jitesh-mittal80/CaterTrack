import express from "express";
import cors from "cors";
import db from "./db.js";
import env from "./env.js";
import foodRoutes from './routes/foodRoutes.js';
import authRoutes from './routes/authRoutes.js';
import orderRoutes from './routes/orderRoutes.js';
import bodyParser from "body-parser";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { Server } from "socket.io";
import http from "http";

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

//paths 
app.use('/auth', authRoutes);
app.use('/Food_items', foodRoutes);
app.use('/user-orders', orderRoutes);

io.on("connection", (socket) => {
  console.log("User Connected", socket.id);
  socket.on("disconnect", () => {
    console.log("User Disconnected", socket.id);
  });
  socket.on("new_order", (orderData)=>{
    console.log("New Order Received", orderData);
    io.emit("order_received", orderData);
  });
});

const PORT = env.PORT || 4000;
server.listen(PORT, () => console.log(`✅ Server running on port ${PORT}`));

