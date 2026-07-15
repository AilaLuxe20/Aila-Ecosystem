"use client";

import ChatWindow from "./ChatWindow";
import ChatInput from "./ChatInput";
import PromptSuggestions from "./PromptSuggestions";

export default function AilaAssistant(){

return(

<div className="mx-auto max-w-5xl">

<PromptSuggestions/>

<ChatWindow/>

<ChatInput/>

</div>

);

}