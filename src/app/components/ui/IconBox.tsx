"use client";

import { LucideIcon } from "lucide-react";

export default function IconBox({
icon:Icon,
}:{
icon:LucideIcon;
}){

return(

<div className="inline-flex rounded-2xl bg-gradient-to-br from-cyan-500 to-blue-600 p-5 shadow-[0_0_40px_rgba(34,211,238,.25)]">

<Icon className="h-8 w-8 text-white"/>

</div>

);

}