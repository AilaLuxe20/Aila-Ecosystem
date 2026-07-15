"use client";

const steps=[
"Discovery",
"Design",
"Development",
"Launch"
];

export default function Process(){

return(

<section className="py-28">

<div className="grid gap-8 xl:grid-cols-4">

{steps.map((step,index)=>(

<div
key={step}
className="glass rounded-3xl p-8"
>

<div className="text-5xl font-black text-cyan-400">

0{index+1}

</div>

<h3 className="mt-6 text-2xl font-bold">

{step}

</h3>

</div>

))}

</div>

</section>

);

}