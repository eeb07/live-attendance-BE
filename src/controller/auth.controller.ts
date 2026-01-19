// @ts-ignore
import bcrypt from 'bcrypt';

import type { Request, Response } from 'express';
import { signupSchema, loginSchema } from '../validators/auth.schema.js';
import User from '../models/user.js';
import jwt from 'jsonwebtoken';
import dotenv from "dotenv"
import { success } from 'zod';


const JWT_PASSWORD = process.env.JWT_PASSWORD as string;


export const signupController = async (req: Request, res: Response) => {
    const parseDataSuccess = signupSchema.safeParse(req.body)
    if (!parseDataSuccess.success) {
        return res.status(400).json({
            success: false,
            error: "Invalid request schema"
        });
    }
    const { name, email, password, role } = req.body
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


export const loginController = async (req: Request, res: Response) => {

    const email = req.body.email;
    const password = req.body.password;
    try {
        const existingUser = await User.findOne({
            email
        }).select("+password")

        if (existingUser && existingUser.password) {

            const isPasswordValid = await bcrypt.compare(password, existingUser.password)

            if (isPasswordValid) {

                const token = jwt.sign({
                    id: existingUser._id
                }, JWT_PASSWORD)
                return res.status(200).json({
                    success: true,
                    data: {
                        token: token
                    }
                })
            }

           
        } else {
                return res.status(400).json({
                    success: false,
                    error: "Invalid email or password"

                })
            }

    } catch (error) {
        res.json({
            message: "error while fetching details "
        })

    }


}


