import * as z from 'zod'

export const activeAttendanceSchema = z.object({
    classId: z.string().min(1)
})