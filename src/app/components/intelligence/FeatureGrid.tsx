const features=[
"AI Chat",
"Voice Mode",
"Memory",
"Vision",
"Code",
"Documents",
"Automation",
"Business",
];

export default function FeatureGrid(){

return(

<div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">

{features.map(item=>(

<div
key={item}
className="rounded-2xl border border-white/10 bg-white/5 p-6 transition hover:border-cyan-400 hover:bg-cyan-500/10">

<div className="mb-4 text-3xl">
?
</div>

<h3 className="font-bold">
{item}
</h3>

</div>

))}

</div>

);

}
