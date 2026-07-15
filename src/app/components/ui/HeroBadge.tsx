"use client";

import { Sparkles } from "lucide-react";

export default function HeroBadge(){

return(

<div className="inline-flex items-center gap-3 rounded-full border border-cyan-500/20 bg-cyan-500/10 px-5 py-2 text-cyan-300">

<Sparkles className="h-5 w-5"/>

<span className="text-sm font-bold uppercase tracking-[0.4em]">

AI SOFTWARE COMPANY

</span>

</div>

);

}