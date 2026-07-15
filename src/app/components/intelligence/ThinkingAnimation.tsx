"use client";

export default function ThinkingAnimation(){

return(

<div className="flex gap-2">

<div className="h-3 w-3 animate-bounce rounded-full bg-cyan-400"/>

<div
className="h-3 w-3 animate-bounce rounded-full bg-cyan-400"
style={{animationDelay:".2s"}}
/>

<div
className="h-3 w-3 animate-bounce rounded-full bg-cyan-400"
style={{animationDelay:".4s"}}
/>

</div>

);

}