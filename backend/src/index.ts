import express ,{ Request, Response } from "express";
import "dotenv/config";
import http from "http";

const server = express();
// This is required when integrating Socket.IO because Socket.IO
const httpServer = http.createServer(server); 
const port = process.env.PORT || 5000;


server.get("/",(_req : Request,res : Response)=>{
    res.send("Hello world");
});

// Start Server
const startServer = async () => {
    httpServer.listen(port, () => {
    console.log(`🚀 Server running at http://localhost:${port}`);
  });
};

startServer();

