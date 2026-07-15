const skills=[
"AI Development",
"Websites",
"Mobile Apps",
"Automation",
"Legal AI",
"Business",
"Marketing",
"Design",
];

export default function SkillCard(){

return(

<div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">

{skills.map(skill=>(

<div
key={skill}
className="rounded-2xl border border-white/10 bg-white/5 p-6 transition hover:border-cyan-400 hover:bg-cyan-500/10">

<div className="mb-3 text-3xl">
??
</div>

<h3 className="font-bold">
{skill}
</h3>

</div>

))}

</div>

);

}
