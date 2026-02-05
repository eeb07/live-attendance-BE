# 📚 Live Attendance System - Backend

A real-time attendance management system for live classes, built with Node.js, Express, TypeScript, and WebSockets. Teachers can mark attendance in real-time, and students can instantly view their attendance status with live updates.

## ✨ Features

- 🔐 **JWT Authentication** - Secure user authentication with role-based access
- 👥 **Role-Based Access Control** - Separate permissions for Teachers and Students
- 📖 **Class Management** - Create classes and enroll students
- ⚡ **Real-Time Attendance** - Mark and view attendance using WebSockets
- 📊 **Live Summary** - Real-time attendance statistics and reports
- 💾 **Data Persistence** - Attendance records stored in MongoDB
- ✅ **Input Validation** - Zod schema validation for all requests

## 🛠️ Tech Stack

- **Runtime:** Node.js
- **Framework:** Express.js
- **Language:** TypeScript
- **Database:** MongoDB with Mongoose ODM
- **Authentication:** JWT (JSON Web Tokens)
- **Real-Time Communication:** WebSocket (ws)
- **Validation:** Zod

## 📋 Prerequisites

Before you begin, ensure you have the following installed:
- Node.js (v14 or higher)
- MongoDB (local or cloud instance)
- npm or yarn

## 🚀 Getting Started

### 1. Clone the Repository

```bash
git clone https://github.com/eeb07/live-attendance-BE.git
cd live-attendance-BE
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Environment Configuration

Create a `.env` file in the root directory:

```env
PORT=3000
MONGO_URI=mongodb://localhost:27017/attendance
JWT_PASSWORD=your_super_secret_jwt_key
NODE_ENV=development
```

### 4. Run the Application

**Development mode:**
```bash
npm run dev
```

**Production mode:**
```bash
npm run build
npm start
```

The server will start at `http://localhost:3000`

## 📡 API Endpoints

### Authentication

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register a new user |
| POST | `/api/auth/login` | Login and get JWT token |

### Classes

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/classes` | Create a new class (Teacher) |
| GET | `/api/classes` | Get all classes |
| POST | `/api/classes/:id/enroll` | Enroll student in class |

### Attendance

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/attendance/:classId` | Get attendance for a class |
| GET | `/api/attendance/student/:studentId` | Get student's attendance history |

## 🔌 WebSocket Connection

Connect to the WebSocket server with a valid JWT token:

```javascript
const token = "your_jwt_token";
const ws = new WebSocket(`ws://localhost:3000/ws?token=${token}`);

ws.on('open', () => {
  console.log('Connected to WebSocket');
});
```

### WebSocket Events

#### Teacher Events

**Mark Attendance:**
```json
{
  "type": "ATTENDANCE_MARKED",
  "data": {
    "classId": "class_id",
    "studentId": "student_id",
    "status": "present"
  }
}
```

**Get Today's Summary:**
```json
{
  "type": "TODAY_SUMMARY",
  "data": {
    "classId": "class_id"
  }
}
```

**Persist Attendance:**
```json
{
  "type": "DONE",
  "data": {
    "classId": "class_id"
  }
}
```

#### Student Events

**Check My Attendance:**
```json
{
  "type": "MY_ATTENDANCE",
  "data": {
    "classId": "class_id"
  }
}
```

## 📁 Project Structure

```
live-attendance-BE/
├── src/
│   ├── controllers/     # Request handlers
│   ├── models/          # Mongoose models
│   ├── routes/          # API routes
│   ├── middlewares/     # Auth & validation middlewares
│   ├── utils/           # Helper functions
│   ├── validators/      # Zod schemas
│   ├── websocket/       # WebSocket handlers
│   └── index.ts         # Application entry point
├── .env                 # Environment variables
├── .gitignore
├── package.json
├── tsconfig.json
└── README.md
```


## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request


## 👤 Author

**eeb07**
- GitHub: [@eeb07](https://github.com/eeb07)

## 🙏 Acknowledgments

- Built with ❤️ for improving classroom attendance management
- Inspired by the need for real-time attendance tracking

---

⭐ If you find this project helpful, please give it a star!
