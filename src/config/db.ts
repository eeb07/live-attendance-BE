import mongoose from "mongoose";
import dotenv from "dotenv"

dotenv.config();
function connectDB(){
    try{
        mongoose.connect(process.env.MONGO_URL as string )
        console.log("MongoDb conncetd")
    }catch{
        console.log("DB not connect")
     return false
    }
}


export default connectDB;