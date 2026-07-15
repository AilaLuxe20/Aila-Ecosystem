"use client";

export default function VoiceVisualizer(){

return(

<div className="flex h-32 items-end justify-center gap-2">

{Array.from({length:24}).map((_,i)=>(

<div
key={i}
className="w-2 animate-pulse rounded-full bg-cyan-400"
style={{
height:`${20+(i%8)*12}px`
}}
/>

))}

</div>

);

}
