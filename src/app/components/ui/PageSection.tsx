"use client";

import { cn } from "@/lib/utils";

export default function PageSection({
  children,
  className,
}:{
  children:React.ReactNode;
  className?:string;
}){

  return(

<section
className={cn(
"relative py-32",
className
)}
>

<div className="mx-auto max-w-7xl px-6">

{children}

</div>

</section>

);

}