"use client";

import { cn } from "@/lib/utils";

export default function GlowCard({
  children,
  className,
}:{
  children:React.ReactNode;
  className?:string;
}){

return(

<div
className={cn(
"group relative overflow-hidden rounded-[36px] border border-white/10 bg-white/[0.04] backdrop-blur-2xl transition duration-500 hover:-translate-y-2 hover:border-cyan-400/30",
className
)}
>

<div className="absolute inset-0 opacity-0 transition duration-500 group-hover:opacity-100 bg-[radial-gradient(circle_at_top,rgba(34,211,238,.12),transparent_70%)]"/>

<div className="relative z-10">

{children}

</div>

</div>

);

}