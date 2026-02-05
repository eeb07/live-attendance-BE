import { model, Schema, type ObjectId, type Types } from "mongoose";

interface IAttendance {
    classId: Types.ObjectId,
    studentId: Types.ObjectId,
    status: "present" | "absent"
}

const attendanceSchema = new Schema<IAttendance>({
    classId: {
        type: Schema.Types.ObjectId,
        ref: "Class",
        required: true
    },
    studentId: [{
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true
    }],

    status: {
        type: String,
        enum: ["present", "absent"],
        required: true
    }
})
const Attendance = model<IAttendance>("Attendance", attendanceSchema);

export default Attendance;