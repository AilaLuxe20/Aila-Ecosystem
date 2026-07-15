"use client";

const chats=[
"AI Assistant",
"Website Project",
"Contract Review",
"Automation",
];

export default function RecentChats(){

return(

<div className="glass rounded-[32px] p-8">

<h3 className="mb-6 text-2xl font-black">

Recent

</h3>

<div className="space-y-4">

{chats.map(chat=>(

<div
key={chat}
className="rounded-2xl bg-white/5 p-4"
>

{chat}

</div>

))}

</div>

</div>

);

}