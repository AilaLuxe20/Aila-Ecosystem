export default function Header(){
return(
<header className="flex items-center justify-between border-b border-white/10 bg-black/30 px-8 py-6 backdrop-blur-xl">

<div>
<p className="text-sm uppercase tracking-[0.4em] text-cyan-400">
AILA Intelligence
</p>

<h1 className="mt-2 text-4xl font-black">
Your AI Operating System
</h1>
</div>

<div className="flex items-center gap-3">

<div className="h-3 w-3 animate-pulse rounded-full bg-green-400"/>

<p className="text-slate-400">
Online
</p>

</div>

</header>
);
}
