import { model, Schema, Types, type ObjectId } from "mongoose";

interface IClass{
    className: string, 
    teacherId: ObjectId,
    studentIds: Types.ObjectId[]

}

const createClassSchema = new Schema<IClass>({
    className: { type: String, required: true
    },
    teacherId: {
        type: Schema.Types.ObjectId, 
        ref: "User",
        required: true
    },
    studentIds:[{
        type: Schema.Types.ObjectId, 
        ref: "User",
        default: []
      
    }]
})

const Class = model<IClass>("Class", createClassSchema);

export default Class;