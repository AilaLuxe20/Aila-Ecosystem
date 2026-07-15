const items=[
"Generated mobile app proposal",
"Analyzed legal agreement",
"Created landing page",
"Generated Next.js component",
"Answered customer question",
];

export default function RecentActivity(){

return(

<div className="rounded-3xl border border-white/10 bg-white/5 p-8">

<h2 className="mb-8 text-2xl font-bold">
Recent Activity
</h2>

<div className="space-y-5">

{items.map(item=>(

<div
key={item}
className="rounded-xl bg-black/20 p-4">

? {item}

</div>

))}

</div>

</div>

);

}
