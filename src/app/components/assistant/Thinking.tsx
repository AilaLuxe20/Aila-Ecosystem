"use client";

export default function Thinking(){

return(

<div className="flex items-center gap-3">

<div className="h-3 w-3 animate-bounce rounded-full bg-cyan-400"></div>

<div className="h-3 w-3 animate-bounce rounded-full bg-cyan-400 [animation-delay:150ms]"></div>

<div className="h-3 w-3 animate-bounce rounded-full bg-cyan-400 [animation-delay:300ms]"></div>

<span className="ml-4 text-sm text-slate-400">

Aila is thinking...

</span>

</div>

);

}
