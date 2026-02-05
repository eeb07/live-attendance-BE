import { WebSocketServer } from "ws";
import type { Server } from "http";
import jwt from "jsonwebtoken";
import { sessionActive } from "./state/activeSession.js";
import { object } from "zod";
import Class from "./models/class.js";
import Attendance from "./models/attendance.js";

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
            ws.on("message", async (rawMessage) => {
                try {
                    const { event, data } = JSON.parse(rawMessage.toString());

                    switch (event) {
                        case "ATTENDANCE_MARKED": {
                            // Role check
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
                        case "MY_ATTENDANCE": {
                            if ((ws as any).user.role !== "student") {
                                ws.send(JSON.stringify({
                                    event: "ERROR",
                                    data: { message: "Forbidden, student event only" }
                                }));
                                return;
                            }

                            if (!sessionActive.activeSession) {
                                ws.send(JSON.stringify({
                                    event: "ERROR",
                                    data: { message: "No active attendance session" }
                                }));
                                return;
                            }

                            const studentId = (ws as any).user.userId;
                            const status = sessionActive.activeSession.attendance[studentId] ?? "not yet updated";


                            ws.send(JSON.stringify({
                                event: "MY_ATTENDANCE",
                                data: { status }
                            }));
                            break;
                        }
                        case "TODAY_SUMMARY": {
                            if ((ws as any).user.role !== "teacher") {
                                ws.send(JSON.stringify({
                                    event: "ERROR",
                                    data: { message: "Forbidden, teacher only access" }
                                }));
                                return;
                            }
                            if (!sessionActive.activeSession) {
                                ws.send(JSON.stringify({
                                    error: "ERROR",
                                    data: { message: "No active session" }
                                }));
                                return;
                            }
                            const attendance = sessionActive.activeSession.attendance;
                            const values = Object.values(attendance);
                            const present = values.filter(v => v === "present").length;
                            const absent = values.filter(v => v === "absent").length;
                            const total = values.length;


                            // broadcast 
                            wss.clients.forEach(client => {
                                if (client.readyState === 1) {
                                    client.send(JSON.stringify({
                                        event: "TODAY_SUMMARY",
                                        data: { present, absent, total }
                                    }));
                                }
                            });
                            break;

                        }
                        case "DONE": {
                            // Role check
                            if ((ws as any).user.role !== "teacher") {
                                ws.send(JSON.stringify({
                                    event: "ERROR",
                                    data: { message: "Forbidden, teacher event only" }
                                }));
                                return;
                            }
                            // active sessin check 
                            if (!sessionActive.activeSession) {
                                ws.send(JSON.stringify({
                                    event: "ERROR",
                                    data: { message: "No active attendance session" }
                                }))
                            }
                            // get classId from memory
                            const classId = sessionActive.activeSession?.classId;

                            // get the class id from db
                            const existingClass = await Class.findById(classId);

                            if (!existingClass) {
                                ws.send(JSON.stringify({
                                    event: "ERROR",
                                    data: { message: "Class not found " }
                                }));
                                return;
                            }

                            // mark attendance for students who are in db not in memory
                            const attendance = sessionActive.activeSession!.attendance;
                            for (const studentObjectId of existingClass.studentIds) {
                                const studentId = studentObjectId.toString();

                                if (!attendance[studentId]) {
                                    attendance[studentId] = "absent";

                                }

                            }
                            const attendanceEntries = sessionActive.activeSession!.attendance;
                            for (const studentId in attendanceEntries) {
                            //@ts-ignore
                            await Attendance.create({
                                    classId: existingClass._id,
                                    studentId: studentId,
                                    status: attendanceEntries[studentId]
                                })
                            }

                            sessionActive.activeSession = null;

                            const values = Object.values(attendanceEntries);

                            const present = values.filter(v => v === "present");
                            const absent = values.filter(v => v === "absent");
                            const total = values.length;
                        

                            // brodadcast 
                            wss.clients.forEach(client => {
                                if (client.readyState === 1) {
                                    client.send(JSON.stringify({
                                        event: "DONE",
                                        data: {
                                            message: "Attendance persisted",
                                            present, 
                                            absent, 
                                            total
                                        }

                                    }))

                                }
                            })
                        }


                        default:
                            ws.send(
                                JSON.stringify({
                                    event: "ERROR",
                                    data: { message: "Unknown event" },
                                })
                            );
                            break;

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
