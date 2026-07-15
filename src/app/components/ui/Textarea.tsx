"use client";

import { forwardRef, TextareaHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

type TextareaProps = TextareaHTMLAttributes<HTMLTextAreaElement>;

const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, ...props }, ref) => {
    return (
      <textarea
        ref={ref}
        {...props}
        className={cn(
          `
          min-h-[180px]
          w-full
          resize-none
          rounded-3xl
          border
          border-white/10
          bg-white/[0.04]
          px-6
          py-5
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

Textarea.displayName = "Textarea";

export default Textarea;