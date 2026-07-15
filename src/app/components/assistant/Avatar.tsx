export default function Avatar() {

return (

<div className="rounded-3xl border border-white/10 bg-white/5 p-8 text-center">

<div className="mx-auto flex h-56 w-56 items-center justify-center rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 text-8xl shadow-[0_0_80px_#22d3ee]">

AI

</div>

<h2 className="mt-8 text-3xl font-black">
Aila
</h2>

<p className="mt-3 text-slate-400">
Your Personal AI Assistant
</p>

<div className="mt-8 space-y-3">

<div className="rounded-xl bg-cyan-500/10 p-3">
Status : Online
</div>

<div className="rounded-xl bg-cyan-500/10 p-3">
Memory : Active
</div>

<div className="rounded-xl bg-cyan-500/10 p-3">
Voice : Ready
</div>

<div className="rounded-xl bg-cyan-500/10 p-3">
Vision : Ready
</div>

</div>

</div>

);

}
