"use client";

import MessageBubble from "./MessageBubble";

export default function ChatWindow(){

return(

<div className="glass rounded-[36px] p-8 h-[650px] overflow-y-auto">

<MessageBubble
role="assistant"
message="Hello, I'm Aila."
/>

</div>

);

}