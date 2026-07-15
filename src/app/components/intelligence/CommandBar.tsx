export default function CommandBar(){

return(

<div className="flex items-center gap-4 rounded-2xl border border-white/10 bg-black/30 p-5 backdrop-blur-xl">

<button className="rounded-xl bg-cyan-500 px-6 py-3">
??
</button>

<button className="rounded-xl bg-white/10 px-6 py-3">
??
</button>

<button className="rounded-xl bg-white/10 px-6 py-3">
??
</button>

<input
className="flex-1 bg-transparent outline-none"
placeholder="Ask Aila anything..."
/>

<button className="rounded-xl bg-cyan-500 px-8 py-3 font-bold">
Send
</button>

</div>

);

}
