import { model, Schema, } from 'mongoose';
interface IUser {
    name: string,
    email: string,
    password: string,
    role: "teacher" | "student"
}
const userSchema = new Schema<IUser>({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true, select: false },
    role: {
        type: String,
        enum: ['teacher', 'student'],
        required: true
    }
})

const User = model<IUser>("User", userSchema)

export default User;



