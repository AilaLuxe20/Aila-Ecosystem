"use client";

import { useEffect, useState } from "react";

type Props={
sendAction:(message:string)=>void;
loading:boolean;
voiceText?:string;
};

export default function ChatInput({
sendAction,
loading,
voiceText=""
}:Props){

const[text,setText]=useState("");

useEffect(()=>{

if(voiceText.trim()){

setText(voiceText);

}

},[voiceText]);

function submit(){

if(!text.trim()) return;

sendAction(text);

setText("");

}

return(

<div className="rounded-3xl border border-white/10 bg-[#0b1220]/80 p-6 backdrop-blur-xl">

<div className="flex gap-4">

<textarea
rows={2}
value={text}
onChange={(e)=>setText(e.target.value)}
onKeyDown={(e)=>{

if(e.key==="Enter"&&!e.shiftKey){

e.preventDefault();

submit();

}

}}
placeholder="Talk to Aila..."
className="flex-1 resize-none rounded-2xl bg-[#111827] px-6 py-5 text-white outline-none"
/>

<button
onClick={submit}
disabled={loading}
className="rounded-2xl bg-cyan-500 px-8 py-5 font-bold transition hover:bg-cyan-400 disabled:opacity-50">

{loading?"Thinking...":"Send"}

</button>

</div>

</div>

);

}

