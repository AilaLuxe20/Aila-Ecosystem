const tools=[
"Website Builder",
"Mobile Apps",
"AI Agents",
"Automation",
"Contracts",
"Documents",
"Image Analysis",
"Code Generator",
"Marketing",
"Sales",
"CRM",
"Analytics"
];

export default function ToolsGrid(){

return(

<div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">

{tools.map(tool=>(

<div
key={tool}
className="rounded-2xl border border-white/10 bg-white/5 p-6 transition hover:scale-105 hover:border-cyan-400 hover:bg-cyan-500/10">

<div className="mb-4 text-4xl">
?
</div>

<h3 className="font-bold">
{tool}
</h3>

</div>

))}

</div>

);

}
