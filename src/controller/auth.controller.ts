// @ts-ignore
import bcrypt from 'bcrypt';

import type { Request, Response } from 'express';
import signupSchema from '../validators/auth.schema.js';
import User from '../models/user.js';

 export const signupController =  async (req:Request, res: Response) => {
    const parseDataSuccess = signupSchema.safeParse(req.body)
    if (!parseDataSuccess.success) {
      return res.status(400).json({
            success: false,
            error: "Invalid request schema"
        });
        
    } 
    const {name, email, password, role}  = req.body
    // const name = req.body.name;
    // const email = req.body.email;
    // const password = req.body.password;
    // const role = req.body.role;


    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res.status(400).json({
            success: false,
            error: "Email already exists"
        });
        


    }
    const hashedPassword = await bcrypt.hash(password, 10)

    const createdUser = await User.create({
        name,
        email,
        password: hashedPassword,
        role
    });
   return res.status(201).json({
        success: true,
        data: {
            _id: createdUser._id,
            name: createdUser.name,
            email: createdUser.email,
            role: createdUser.role
        },
    });
};


