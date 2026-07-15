"use client";

export default function VoiceWave(){

return(

<div className="flex items-end justify-center gap-2 h-20">

{[24,52,40,65,34,55,30,70].map((h,i)=>(

<div
key={i}
style={{height:h}}
className="w-2 animate-pulse rounded-full bg-cyan-400"
/>

))}

</div>

);

}
