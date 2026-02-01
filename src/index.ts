import express from "express";
import connectDB from "./config/db.js";
import router from "./routes/auth.routes.js";
import http from "http"
import { setupWebSocket } from "./ws.js";
const app = express();

app.use(express.json())

connectDB();


app.use("/auth", router);

const server = http.createServer(app);
setupWebSocket(server);

server.listen(3000, ()=>{
    console.log("Http + websocket running on port 3000")
});


 