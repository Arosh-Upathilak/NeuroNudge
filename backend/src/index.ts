/**
 * Main application entrypoint configuring the Express server and middleware.
 */
import express, { Request, Response } from "express";
import "dotenv/config";
import http from "http";
import imageRoutes from "./routes/object.routes";
import memoryRoutes from "./routes/memory.routes";
import nlpRoutes from "./routes/nlp.routes";
import userRoutes from "./routes/user.routes";
import messageroutes from "./routes/messages.route";

const server = express();
const httpServer = http.createServer(server);
const port = process.env.PORT || 5000;

server.use(express.json());
server.use(express.urlencoded({ extended: true }));

server.get("/", (_req: Request, res: Response) => {
  res.send("Hello world");
});



// Register routes
server.use("/api/images", imageRoutes);
server.use("/api/memories", memoryRoutes);
server.use("/api/nlp", nlpRoutes);
server.use("/api/user", userRoutes);
server.use("/api/messages", messageroutes);

const startServer = async () => {
  httpServer.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`);
  });
};

startServer();

