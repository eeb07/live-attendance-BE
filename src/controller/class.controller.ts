import type {Request, Response} from  'express'
import { classSchema } from '../validators/class.schema.js';
import Class from '../models/class.js';


export const classController = async (req: Request, res:Response)=>{

    const parseDataSuccess = classSchema.safeParse(req.body);
    console.log("hello from class Controller")
    if(!parseDataSuccess.success){
       return res.status(400).json({
            success: false, 
            error: "Invalid request schema"
        })
    }
    const role = (req as any).user.role;
    if(role !=="teacher"){
        return res.status(403).json({          
                success: false,
                error: "Forbidden, teacher access require"       
        })
    }

    const className = req.body.className; 
    const teacherId = (req as any).user.userId; 
    const studentIds:any = [];

    const createdClass = await Class.create({
        className, 
        teacherId, 
        studentIds
    })
    res.status(201).json({
        success: true, 
        data:{
            _id: createdClass._id, 
        className: createdClass.className, 
        teacherId: createdClass.teacherId, 
        studentIds: createdClass.studentIds
        }
        
    })
    
}