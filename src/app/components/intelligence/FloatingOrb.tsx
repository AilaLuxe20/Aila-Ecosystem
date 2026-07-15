"use client";

export default function FloatingOrb(){

return(

<div className="fixed bottom-8 left-8 flex h-16 w-16 items-center justify-center">

<div className="absolute h-16 w-16 animate-ping rounded-full bg-cyan-400/20"/>

<div className="absolute h-12 w-12 rounded-full bg-cyan-400 shadow-[0_0_60px_#22d3ee]"/>

</div>

);

}
