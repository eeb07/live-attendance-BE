import * as z from "zod"

export const signupSchema = z.object({
    name: z.string().min(1, "Name should be atleast 1 character"), 
    email: z.email(), 
    password: z.string().min(6, "password should have minimum six characters"), 
    role: z.enum(["teacher", "student"])
})


export const  loginSchema = z.object({
    email: z.email(),
    password: z.string()
})
