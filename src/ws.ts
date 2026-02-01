import { WebSocketServer } from 'ws';
import type { Server } from 'http';

import jwt from 'jsonwebtoken'
import { decode } from 'punycode';
export function setupWebSocket(server: Server) {


    const JWT_PASSWORD = process.env.JWT_PASSWORD as string
    const wss = new WebSocketServer({
        server,
        path: "/ws"

    });
    wss.on("connection", (ws,req) => {

        try{
                    const url = new URL(req.url!, "http://localhost");
        const token = url.searchParams.get("token");

        if(!token){

            ws.send(JSON.stringify({
                event:"Error", 
                data: {message: "Unauthorized or invalid token"}
            }));
            ws.close();
            return;
        }
        const decoded = jwt.verify(token, JWT_PASSWORD);

        if(typeof decoded === "string"){
            ws.send(JSON.stringify({
                event: "error", 
                data : {message: "Unauthorized or invalid token"}
            }))
            ws.close();
            return;
        }
        (ws as any).user= {
            userId: decoded.userId, 
            role:  decoded.role
        };
        console.log("Web Socket authenticated ", (ws as any).user);



        }catch{
            ws.send(JSON.stringify({
                event: "error", 
                data: {message: "Unauthorized or invalid token"}
            }));
            ws.close();
        }
    });




}










