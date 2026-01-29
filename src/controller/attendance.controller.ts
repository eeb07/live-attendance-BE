
import type {Request, Response} from  'express';
import { activeAttendanceSchema } from '../validators/attendance.schema.js';
import Class from '../models/class.js';
import { id } from 'zod/locales';

export const startAttendanceController = async (req:Request, res: Response)=> {
    const {userId, role } = (req as any).user;


    if(role !== "teacher"){
        return res.status(403).json({
            success: false, 
            error: "Forbidden, teachers access only"
        });
    };
    const parsedData = activeAttendanceSchema.safeParse(req.body)
    if(!parsedData.success){
        return res.status(400).json({
            success: false, 
            error: "Invlid request schema"

        });
    };
    const existingClass = await Class.findById(parsedData.data.classId);
    if(!existingClass){
        return res.status(404).json({
            success: false, 
            error: "Class not found"
        });
    };


    if(existingClass.teacherId.toString() !== userId){
        return res.status(403).json({
            success: false, 
            error: "Forbidden not class teacher"
        })

    }

}