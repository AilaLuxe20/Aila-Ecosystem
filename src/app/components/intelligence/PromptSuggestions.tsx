"use client";

const prompts=[
"Build me a SaaS",
"Create a website",
"Legal review",
"Business automation",
];

export default function PromptSuggestions(){

return(

<div className="flex flex-wrap gap-3">

{prompts.map(prompt=>(

<button
key={prompt}
className="rounded-full border border-cyan-500/20 bg-cyan-500/10 px-5 py-2 text-sm"
>

{prompt}

</button>

))}

</div>

);

}