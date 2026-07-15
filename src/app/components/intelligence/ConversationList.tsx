const chats=[
"Aila Ecosystem",
"Legal AI",
"Website Project",
"Automation",
"Business Plan",
];

export default function ConversationList(){
return(
<div className="space-y-3">

{chats.map(chat=>(
<button
key={chat}
className="w-full rounded-xl border border-white/10 bg-white/5 p-4 text-left transition hover:border-cyan-400 hover:bg-cyan-500/10">

{chat}

</button>
))}

</div>
);
}
