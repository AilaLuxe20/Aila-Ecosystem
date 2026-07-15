"use client";

export default function MessageBubble({
  role,
  message,
}:{
  role:"user"|"assistant";
  message:string;
}){

return(

<div
className={`rounded-3xl p-5 max-w-[80%] ${
role==="assistant"
?"bg-white/5"
:"bg-cyan-500"
}`}
>

{message}

</div>

);

}