"use client";

import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { UseFormRegister } from "react-hook-form";

import { RegisterFormData } from "@/lib/validations/auth";

interface PasswordInputProps {
    label: string;
    name: keyof RegisterFormData;
    placeholder?: string;
    error?: string;
    register?: UseFormRegister<RegisterFormData>;
}

export default function PasswordInput({
    label,
    name,
    placeholder,
    error,
    register,
}: PasswordInputProps) {
    const [showPassword, setShowPassword] = useState(false);

    return (
        <div className="space-y-2">
            <label
                htmlFor={name}
                className="block text-sm font-medium text-white/80"
            >
                {label}
            </label>

            <div className="relative">
                <input
                    id={name}
                    type={showPassword ? "text" : "password"}
                    placeholder={placeholder}
                    autoComplete={
                        name === "password" ? "new-password" : "current-password"
                    }
                    {...(register ? register(name) : {})}
                    className={`w-full rounded-xl border bg-white/5 px-4 py-3 pr-12 text-white placeholder:text-white/40 outline-none transition ${error
                        ? "border-red-500 focus:border-red-500"
                        : "border-white/10 focus:border-cyan-400"
                        }`}
                />

                <button
                    type="button"
                    onClick={() => setShowPassword((prev) => !prev)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-white/50 transition hover:text-white"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
            </div>

            {error && <p className="text-sm text-red-400">{error}</p>}
        </div>
    );
}