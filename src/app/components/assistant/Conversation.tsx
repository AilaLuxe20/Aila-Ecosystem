"use client";

import { useEffect, useRef } from "react";
import MessageBubble from "./MessageBubble";
import Thinking from "./Thinking";

type Message={
role:"assistant"|"user";
content:string;
};

type Props={
messages:Message[];
loading:boolean;
};

export default function Conversation({
messages,
loading
}:Props){

const bottomRef=useRef<HTMLDivElement>(null);

useEffect(()=>{
bottomRef.current?.scrollIntoView({
behavior:"smooth"
});
},[messages,loading]);

return(

<div className="h-[600px] overflow-y-auto rounded-[32px] border border-white/10 bg-[#090f1d]/80 p-8">

{messages.length===0&&(

<div className="flex h-full items-center justify-center">

<div className="text-center">

<h2 className="text-4xl font-black">
Welcome to Aila Intelligence
</h2>

<p className="mt-4 text-slate-400">
How can I help you build today?
</p>

</div>

</div>

)}

<div className="space-y-6">

{messages.map((message,index)=>(

<MessageBubble
key={index}
role={message.role}
message={message.content}
/>

))}

{loading&&<Thinking/>}

<div ref={bottomRef}/>

</div>

</div>

);

}
