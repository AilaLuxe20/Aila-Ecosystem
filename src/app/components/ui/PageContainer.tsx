"use client";

import { cn } from "@/lib/utils";

export default function PageContainer({
children,
className,
}:{
children:React.ReactNode;
className?:string;
}){

return(

<div
className={cn(
"mx-auto max-w-[1600px] px-6",
className
)}
>

{children}

</div>

);

}