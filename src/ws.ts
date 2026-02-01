import { WebSocketServer } from 'ws';
import type { Server } from 'http';

export function setupWebSocket(server: Server) {


    const wss = new WebSocketServer({
        server,
        path: "/ws"

    });
    wss.on("connection", (ws) => {
        console.log("WebSocket client connected");
    });

}










