const tasks=[
"Build AI Website",
"Design Mobile App",
"Generate Proposal",
"Review Contract",
"Deploy Project"
];

export default function TaskBoard(){

return(

<div className="rounded-3xl border border-white/10 bg-white/5 p-8">

<h2 className="mb-8 text-2xl font-bold">
Today&apos;s Tasks
</h2>

<div className="space-y-4">

{tasks.map(task=>(

<label
key={task}
className="flex items-center gap-4 rounded-xl bg-black/20 p-4">

<input type="checkbox"/>

<span>{task}</span>

</label>

))}

</div>

</div>

);

}
