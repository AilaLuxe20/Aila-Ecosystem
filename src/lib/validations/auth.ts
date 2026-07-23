import { z } from "zod";

export const registerSchema = z
    .object({
        name: z
            .string()
            .min(2, "Name must be at least 2 characters")
            .max(100, "Name is too long"),

        email: z
            .string()
            .email("Please enter a valid email address"),

        password: z
            .string()
            .min(8, "Password must be at least 8 characters")
            .regex(/[A-Z]/, "Must contain an uppercase letter")
            .regex(/[a-z]/, "Must contain a lowercase letter")
            .regex(/[0-9]/, "Must contain a number"),

        confirmPassword: z.string(),

        acceptTerms: z.boolean(),
    })
    .refine((data) => data.acceptTerms, {
        message: "You must accept the Terms & Conditions",
        path: ["acceptTerms"],
    })
    .refine((data) => data.password === data.confirmPassword, {
        message: "Passwords do not match",
        path: ["confirmPassword"],
    });

export type RegisterFormData = z.infer<typeof registerSchema>;