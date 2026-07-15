"use client";

import {
Home,
BrainCircuit,
Scale,
Settings
} from "lucide-react";

const icons=[
Home,
BrainCircuit,
Scale,
Settings,
];

export default function Dock(){

return(

<div className="fixed bottom-8 left-1/2 z-50 flex -translate-x-1/2 gap-4 rounded-full border border-white/10 bg-black/40 p-4 backdrop-blur-2xl">

{icons.map((Icon,index)=>(

<button
key={index}
className="rounded-xl p-3 transition hover:bg-cyan-500/10"
>

<Icon className="h-6 w-6"/>

</button>

))}

</div>

);

}