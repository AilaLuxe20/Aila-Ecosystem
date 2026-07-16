"use client";

import {
  type LucideIcon,
  BrainCircuit,
  Bot,
  Scale,
  Settings,
  Briefcase,
  Sparkles
} from "lucide-react";

const items: Array<[string, LucideIcon]> = [
["Assistant",BrainCircuit],
["Automation",Bot],
["Legal",Scale],
["Business",Briefcase],
["Settings",Settings],
];

export default function WorkspaceSidebar(){

return(

<aside className="border-r border-white/10 bg-black/30 p-8 backdrop-blur-xl">

<div className="mb-10 flex items-center gap-3">

<Sparkles className="text-cyan-400"/>

<h2 className="text-2xl font-black">

AILA

</h2>

</div>

<div className="space-y-3">

{items.map(([title,Icon])=>(

<button
key={title}
className="flex w-full items-center gap-4 rounded-2xl p-4 transition hover:bg-white/5"
>

<Icon className="h-5 w-5"/>

{title}

</button>

))}

</div>

</aside>

);

}
