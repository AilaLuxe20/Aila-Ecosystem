"use client";

export default function Avatar(){
return(

<div className="relative mx-auto flex h-72 w-72 items-center justify-center">

<div className="absolute h-72 w-72 animate-pulse rounded-full bg-cyan-500/10 blur-3xl"/>

<div className="absolute h-56 w-56 rounded-full border border-cyan-400/30"/>

<div className="absolute h-44 w-44 rounded-full border border-cyan-400/20"/>

<div className="absolute h-32 w-32 rounded-full bg-gradient-to-br from-cyan-400 via-sky-500 to-blue-600 shadow-[0_0_120px_#22d3ee]"/>

<div className="absolute h-6 w-6 animate-ping rounded-full bg-white"/>

</div>

);
}
