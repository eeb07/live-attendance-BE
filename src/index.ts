import express from "express";

import mongoose from "mongoose";
import connectDB from "./config/db.js";
import router from "./routes/auth.routes.js";
const app = express();

app.use(express.json())

connectDB();

app.use("/auth", router);

app.listen(3000, () => {
    console.log("Server running on port 3000")
});
