"use client";

import { forwardRef, InputHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

type InputProps = InputHTMLAttributes<HTMLInputElement>;

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, ...props }, ref) => {
    return (
      <input
        ref={ref}
        {...props}
        className={cn(
          `
          w-full
          rounded-2xl
          border
          border-white/10
          bg-white/[0.04]
          px-5
          py-4
          text-white
          outline-none
          backdrop-blur-xl
          transition-all
          duration-300
          placeholder:text-slate-500
          focus:border-cyan-400
          focus:bg-white/[0.06]
          focus:shadow-[0_0_40px_rgba(34,211,238,.15)]
          `,
          className
        )}
      />
    );
  }
);

Input.displayName = "Input";

export default Input;