"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";

import PasswordInput from "./PasswordInput";
import PasswordStrength from "./PasswordStrength";

import {
    registerSchema,
    RegisterFormData,
} from "@/lib/validations/auth";

export default function RegisterForm() {
    const router = useRouter();

    const [loading, setLoading] = useState(false);

    const {
        register,
        handleSubmit,
        control,
        formState: { errors },
    } = useForm<RegisterFormData>({
        resolver: zodResolver(registerSchema),
        defaultValues: {
            name: "",
            email: "",
            password: "",
            confirmPassword: "",
            acceptTerms: false,
        },
    });

    const password = useWatch({ control, name: "password" });

    async function onSubmit(data: RegisterFormData) {
        setLoading(true);

        try {
            const response = await fetch("/api/register", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    name: data.name,
                    email: data.email,
                    password: data.password,
                }),
            });

            const result = await response.json();

            if (!response.ok) {
                toast.error(result.error || "Registration failed");
                return;
            }

            toast.success("Account created successfully");

            router.push("/login");
        } catch {
            toast.error("Something went wrong");
        } finally {
            setLoading(false);
        }
    }

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="space-y-2">
                <label className="text-sm text-white/80">Full Name</label>

                <input
                    {...register("name")}
                    placeholder="John Doe"
                    className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none focus:border-cyan-400"
                />

                {errors.name && (
                    <p className="text-sm text-red-400">{errors.name.message}</p>
                )}
            </div>

            <div className="space-y-2">
                <label className="text-sm text-white/80">Email</label>

                <input
                    {...register("email")}
                    placeholder="john@example.com"
                    className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none focus:border-cyan-400"
                />

                {errors.email && (
                    <p className="text-sm text-red-400">{errors.email.message}</p>
                )}
            </div>

            <PasswordInput
                label="Password"
                name="password"
                placeholder="Enter password"
                register={register}
                error={errors.password?.message}
            />

            <PasswordStrength password={password} />

            <PasswordInput
                label="Confirm Password"
                name="confirmPassword"
                placeholder="Confirm password"
                register={register}
                error={errors.confirmPassword?.message}
            />

            <label className="flex items-center gap-3 text-sm text-white/70">
                <input type="checkbox" {...register("acceptTerms")} />

                I agree to the Terms & Conditions
            </label>

            {errors.acceptTerms && (
                <p className="text-sm text-red-400">
                    {errors.acceptTerms.message}
                </p>
            )}

            <button
                disabled={loading}
                className="w-full rounded-xl bg-cyan-500 py-3 font-semibold transition hover:bg-cyan-400 disabled:opacity-60"
            >
                {loading ? "Creating Account..." : "Create Account"}
            </button>
        </form>
    );
}