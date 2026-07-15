"use client";

import { useState } from "react";

import Avatar from "./Avatar";
import ChatHeader from "./ChatHeader";
import Conversation from "./Conversation";
import ChatInput from "./ChatInput";
import VoiceButton from "./VoiceButton";
import Orb from "./Orb";

import { useAilaChat } from "@/hooks/useAilaChat";

export default function AilaAssistant(){

const{
messages,
loading,
send
}=useAilaChat();

const[voiceText,setVoiceText]=useState("");

async function handleSend(message:string){

setVoiceText("");

await send(message);

}

return(

<section className="relative overflow-hidden rounded-[40px] border border-white/10 bg-[#050816]/90 p-10 backdrop-blur-3xl">

<Orb/>

<div className="relative z-10">

<ChatHeader/>

<div className="mt-10 grid gap-10 xl:grid-cols-[340px_1fr]">

<div className="space-y-8">

<Avatar/>

<VoiceButton
transcriptAction={setVoiceText}
/>

</div>

<div className="space-y-6">

<Conversation
messages={messages}
loading={loading}
/>

<ChatInput
voiceText={voiceText}
loading={loading}
sendAction={handleSend}
/>

</div>

</div>

</div>

</section>

);

}

