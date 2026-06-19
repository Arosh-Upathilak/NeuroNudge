/**
 * Main application entrypoint configuring the Express server and middleware.
 */
import express, { Request, Response } from "express";
import "dotenv/config";
import http from "http";
import imageRoutes from "./routes/object.routes";
import userRoutes from "./routes/user.routes";
import { errorHandler } from "./middleware/error.middleware";
import swaggerUi from "swagger-ui-express";
import { swaggerSpec } from "./config/swagger";

const server = express();
const httpServer = http.createServer(server);
const port = process.env.PORT || 5000;

server.use(express.json());
server.use(express.urlencoded({ extended: true }));
server.get("/", (_req: Request, res: Response) => {
  res.send("Hello world");
});

if (process.env.NODE_ENV !== "production") {
  server.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));
}

server.use("/api/images", imageRoutes);
server.use("/api/user", userRoutes);

server.use(errorHandler);

const startServer = async () => {
  httpServer.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`);
    if (process.env.NODE_ENV !== "production") {
      console.log(`Swagger docs available at http://localhost:${port}/api-docs`);
    }
  });
};

startServer();

