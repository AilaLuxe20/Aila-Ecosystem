"use client";

export default function AnimatedBackground(){

return(

<div className="pointer-events-none absolute inset-0 overflow-hidden">

<div className="absolute left-[-200px] top-[-200px] h-[700px] w-[700px] rounded-full bg-cyan-500/10 blur-[180px]" />

<div className="absolute right-[-250px] bottom-[-250px] h-[700px] w-[700px] rounded-full bg-violet-600/10 blur-[180px]" />

<div className="absolute left-1/2 top-1/2 h-[500px] w-[500px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/5" />

</div>

);
}