"use client";

export default function SearchBar(){

return(

<div className="flex items-center rounded-2xl border border-white/10 bg-black/20 px-6 py-4">

<input
className="flex-1 bg-transparent outline-none placeholder:text-slate-500"
placeholder="Search conversations, projects or documents..."
/>

<button className="rounded-xl bg-cyan-500 px-6 py-3 font-bold">
Search
</button>

</div>

);

}
