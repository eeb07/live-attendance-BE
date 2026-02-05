Live Attendance System (Backend)

A backend system for managing live class attendance using REST APIs and WebSockets.
Teachers can mark attendance in real time, students can view their status instantly, and attendance is stored in MongoDB.

Tech Stack

Node.js

Express

TypeScript

MongoDB + Mongoose

JWT Authentication

WebSocket (ws)

Zod Validation

Features

User authentication (Teacher / Student)

Role-based access control

Class creation and student enrollment

Live attendance using WebSockets

Real-time attendance summary

Attendance persistence in MongoDB

Setup
1. Clone repository
git clone https://github.com/eeb07/live-attendance-BE.git
cd live-attendance-BE

2. Install dependencies
npm install

3. Environment variables

Create a .env file:

PORT=3000
MONGO_URI=your_mongodb_url
JWT_PASSWORD=your_jwt_secret

4. Run server
npm run dev

WebSocket Connection
ws://localhost:3000/ws?token=<JWT_TOKEN>

WebSocket Events

ATTENDANCE_MARKED – Teacher marks attendance

MY_ATTENDANCE – Student checks status

TODAY_SUMMARY – Live summary

DONE – Persist attendance