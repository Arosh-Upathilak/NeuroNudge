import express ,{ Request, Response } from "express";
import "dotenv/config";
import http from "http";
import imageRoutes from "./routes/object.routes";
import userRoutes from "./routes/user.routes";
import { errorHandler } from "./middleware/error.middleware";

const server = express();
// This is required when integrating Socket.IO because Socket.IO
const httpServer = http.createServer(server); 
const port = process.env.PORT || 5000;

server.use(express.json());
server.use(express.urlencoded({ extended: true }));
server.get("/",(_req : Request,res : Response)=>{
    res.send("Hello world");
});

// Register routes
server.use("/api/images", imageRoutes);
server.use("/api/user", userRoutes);

// Centralized Error Handler (must be registered last)
server.use(errorHandler);

// Start Server
const startServer = async () => {
    httpServer.listen(port, () => {
    console.log(`🚀 Server running at http://localhost:${port}`);
  });
};

startServer();

