const projects=[
"Aila Intelligence",
"AilaLegal",
"AilaFlow",
"Aila Commerce",
"Aila Sites",
"Aila Automation",
];

export default function ProjectCard(){

return(

<div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">

{projects.map(project=>(

<div
key={project}
className="rounded-3xl border border-white/10 bg-white/5 p-8 transition hover:border-cyan-400 hover:bg-cyan-500/10">

<div className="mb-6 text-5xl">
??
</div>

<h3 className="text-2xl font-black">
{project}
</h3>

<p className="mt-4 text-slate-400">
Open workspace
</p>

</div>

))}

</div>

);

}
