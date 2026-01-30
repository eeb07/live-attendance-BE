
import type {Request, Response} from  'express';
import { activeAttendanceSchema } from '../validators/attendance.schema.js';
import Class from '../models/class.js';
import {sessionActive}  from '../state/activeSession.js';


export const startAttendanceController = async (req:Request, res: Response)=> {
    const {userId, role } = (req as any).user;


    if(role !== "teacher"){
        return res.status(403).json({
            success: false, 
            error: "Forbidden, teachers access only"
        });
    };
    const parsedData = activeAttendanceSchema.safeParse(req.body);
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

    sessionActive.activeSession = {
        classId: parsedData.data.classId, 
        startedAt: new Date().toISOString(), 
        attendance: {}
    }
    return res.status(200).json({
        success: true, 
        data: {
            classId : sessionActive.activeSession.classId, 
            startedAt: sessionActive.activeSession.startedAt
        }
    });


        
    

}



