import { WebSocketServer } from "ws";
import type { Server } from "http";
import jwt from "jsonwebtoken";
import { sessionActive } from "./state/activeSession.js";

export function setupWebSocket(server: Server) {
  const JWT_PASSWORD = process.env.JWT_PASSWORD as string;

  const wss = new WebSocketServer({
    server,
    path: "/ws",
  });

  wss.on("connection", (ws, req) => {
    try {
      //  Extract token from query
      const url = new URL(req.url!, "http://localhost");
      const token = url.searchParams.get("token");

      if (!token) {
        ws.send(
          JSON.stringify({
            event: "ERROR",
            data: { message: "Unauthorized or invalid token" },
          })
        );
        ws.close();
        return;
      }

      //  Verify JWT
      const decoded = jwt.verify(token, JWT_PASSWORD);

      if (typeof decoded === "string") {
        ws.send(
          JSON.stringify({
            event: "ERROR",
            data: { message: "Unauthorized or invalid token" },
          })
        );
        ws.close();
        return;
      }

      //  Attach user to socket
      (ws as any).user = {
        userId: decoded.userId,
        role: decoded.role,
      };

      console.log("WebSocket authenticated:", (ws as any).user);

      //  Listen for messages
      ws.on("message", (rawMessage) => {
        try {
          const { event, data } = JSON.parse(rawMessage.toString());

          switch (event) {
            case "ATTENDANCE_MARKED": {
              // 👮 Role check
              if ((ws as any).user.role !== "teacher") {
                ws.send(
                  JSON.stringify({
                    event: "ERROR",
                    data: { message: "Forbidden, teacher event only" },
                  })
                );
                return;
              }

              // Active session check
              if (!sessionActive.activeSession) {
                ws.send(
                  JSON.stringify({
                    event: "ERROR",
                    data: { message: "No active attendance session" },
                  })
                );
                return;
              }

              const { studentId, status } = data || {};

              // Validate payload
              if (
                !studentId ||
                (status !== "present" && status !== "absent")
              ) {
                ws.send(
                  JSON.stringify({
                    event: "ERROR",
                    data: { message: "Invalid attendance data" },
                  })
                );
                return;
              }

              // Update in-memory attendance
              sessionActive.activeSession.attendance[studentId] = status;

              console.log(
                "Attendance updated:",
                studentId,
                status
              );

              // Broadcast to ALL clients
              wss.clients.forEach((client) => {
                if (client.readyState === 1) {
                  client.send(
                    JSON.stringify({
                      event: "ATTENDANCE_MARKED",
                      data: { studentId, status },
                    })
                  );
                }
              });

              break;
            }

            default:
              ws.send(
                JSON.stringify({
                  event: "ERROR",
                  data: { message: "Unknown event" },
                })
              );
          }
        } catch {
          ws.send(
            JSON.stringify({
              event: "ERROR",
              data: { message: "Invalid message format" },
            })
          );
        }
      });
    } catch {
      ws.send(
        JSON.stringify({
          event: "ERROR",
          data: { message: "Unauthorized or invalid token" },
        })
      );
      ws.close();
    }
  });
}
