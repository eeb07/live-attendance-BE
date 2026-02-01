import type { Request, Response } from 'express'
import { addStudentSchema, classSchema } from '../validators/class.schema.js';
import Class from '../models/class.js';
import User from "../models/user.js";


export const classController = async (req: Request, res: Response) => {

  const parseDataSuccess = classSchema.safeParse(req.body);
  if (!parseDataSuccess.success) {
    return res.status(400).json({
      success: false,
      error: "Invalid request schema"
    })
  }
  const role = (req as any).user.role;
  if (role !== "teacher") {
    return res.status(403).json({
      success: false,
      error: "Forbidden, teacher access require"
    })
  }

  const className = req.body.className;
  const teacherId = (req as any).user.userId;
  const studentIds: any = [];

  const createdClass = await Class.create({
    className,
    teacherId,
    studentIds
  })
  res.status(201).json({
    success: true,
    data: {
      _id: createdClass._id,
      className: createdClass.className,
      teacherId: createdClass.teacherId,
      studentIds: createdClass.studentIds
    }

  })
};

export const addStudentController = async (req: Request, res: Response) => {
  const classId = req.params.id;
  const { userId, role } = (req as any).user;

  if (role !== "teacher") {
    return res.status(403).json({
      success: false,
      error: "Forbidden, teacher access required"
    });
  }

  const parsed = addStudentSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({
      success: false,
      error: "Invalid request schema"
    });
  }

  const studentId = parsed.data.studentId;
  const existingClass = await Class.findById(classId);
  if (!existingClass) {
    return res.status(404).json({
      success: false,
      error: "Class not found"
    });
  }

  if (existingClass.teacherId.toString() !== userId) {
    return res.status(403).json({
      success: false,
      error: "Forbidden, not class teacher"
    });
  }


  const studentUser = await User.findById(studentId);
  if (!studentUser || studentUser.role !== "student") {
    return res.status(404).json({
      success: false,
      error: "Student not found"
    });
  }

  const alreadyAdded = existingClass.studentIds.some(
    (id) => id.toString() === studentId
  );

  if (alreadyAdded) {
    return res.status(200).json({
      success: true,
      data: {
        _id: existingClass._id,
        className: existingClass.className,
        teacherId: existingClass.teacherId,
        studentIds: existingClass.studentIds,
      },
    });
  }

existingClass.studentIds.push(studentUser._id);
  await existingClass.save();

  return res.status(200).json({
    success: true,
    data: {
      _id: existingClass._id,
      className: existingClass.className,
      teacherId: existingClass.teacherId,
      studentIds: existingClass.studentIds,
    },
  });
};

export const getClassController = async (req: Request, res: Response) => {

  const classId = req.params.id;

  const { userId, role } = (req as any).user;

  // check the db and populate
  const existingClass = await Class.findById(classId).populate("studentIds", "name email")

  if (!existingClass) {
    return res.status(404).json({
      success: false,
      error: "Class not found"
    })

  }
  if (role === "teacher" && existingClass.teacherId.toString() != userId) {
    return res.status(403).json({
      success: false,
      error: "Not class teacher"
    })

  }

  if (role === "student") {
    const studentIdClass = existingClass.studentIds;
    const isStudentInClass = studentIdClass.some(
      (student: any) => student._id.toString() === userId

    )
    if (!isStudentInClass) {
      return res.status(403).json({
        success: false,
        error: "Forbidden"
      })
    }

  } return res.status(200).json({
    success: true,
    data: {
      id: existingClass._id,
      className: existingClass.className,
      teacherId: existingClass.teacherId,
      students: existingClass.studentIds  // populated users
    }
  });
};


export const getStudentsController =  async (req:Request, res:Response)=>{
  
  const {role} = (req as any).user;

  if(role !== "teacher"){
    return res.status(403).json({
      success: false, 
      error: "Teacher acces required"
    });

  }
  const existingUser = await User.find({role:"student"})
  return res.status(200).json({
    success: true, 
    data:existingUser
  })

}


