const actions=[
"Build Website",
"Build Mobile App",
"Generate Proposal",
"Analyze Contract",
"Create Automation",
"Business Strategy",
];

export default function QuickActions(){
return(
<div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">

{actions.map(action=>(
<button
key={action}
className="rounded-2xl border border-white/10 bg-white/5 p-6 text-left transition hover:-translate-y-1 hover:border-cyan-400 hover:bg-cyan-500/10">

<p className="text-cyan-400">
? Quick Start
</p>

<h3 className="mt-3 text-xl font-bold">
{action}
</h3>

</button>
))}

</div>
);
}
