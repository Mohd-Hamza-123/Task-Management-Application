import { z } from "zod";

export const taskSchema = z.object({
    title: z
        .string({ error: "Please enter a task title" })
        .trim()
        .min(1, "Please enter a task title")
        .max(100, "Title must be 100 characters or less"),

    description: z
        .string()
        .max(500, "Description must be 500 characters or less")
        .optional(),

    status: z
        .enum(["pending", "in_progress", "completed"], {
            error: "Please choose a valid status",
        })
        .default("pending"),

    priority: z.enum(["low", "medium", "high"], {
        error: "Please select a priority",
    }),

    assigned_to: z
        .string({ error: "Please assign this task to a user" })
        .min(1, "Please assign this task to a user"),

    due_date: z.coerce.date({ error: "Please select a valid due date" }),
});


export const updateTaskSchema = taskSchema
    .omit({ status: true }) // omit status
    .extend({
        // allow null so fields can be cleared
        description: taskSchema.shape.description.nullable(),
        assigned_to: taskSchema.shape.assigned_to.nullable(),
        due_date: z.coerce
            .date({ error: "Please select a valid due date" })
            .nullable(),
    })
    .partial() //  field becomes optional
    .refine((data) => Object.keys(data).length > 0, {
        error: "No changes to save",
    });

export type TaskInput = z.infer<typeof taskSchema>;
export type UpdateTaskInput = z.infer<typeof updateTaskSchema>;