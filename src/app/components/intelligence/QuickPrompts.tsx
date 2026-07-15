"use client";

const prompts=[
"Build SaaS",
"Review Contract",
"Generate Website",
"Create Mobile App",
"Business Plan",
"Automation",
];

export default function QuickPrompts(){

return(

<div className="flex flex-wrap gap-4">

{prompts.map(prompt=>(

<button
key={prompt}
className="rounded-full border border-cyan-500/20 bg-cyan-500/10 px-5 py-2"
>

{prompt}

</button>

))}

</div>

);

}