export default function Dashboard(){
return(

<div className="grid gap-6 lg:grid-cols-4">

<div className="rounded-2xl border border-cyan-500/20 bg-cyan-500/10 p-6">
<p className="text-cyan-400">Chats</p>
<h2 className="mt-4 text-4xl font-black">128</h2>
</div>

<div className="rounded-2xl border border-cyan-500/20 bg-cyan-500/10 p-6">
<p className="text-cyan-400">Documents</p>
<h2 className="mt-4 text-4xl font-black">53</h2>
</div>

<div className="rounded-2xl border border-cyan-500/20 bg-cyan-500/10 p-6">
<p className="text-cyan-400">Projects</p>
<h2 className="mt-4 text-4xl font-black">17</h2>
</div>

<div className="rounded-2xl border border-cyan-500/20 bg-cyan-500/10 p-6">
<p className="text-cyan-400">AI Status</p>
<h2 className="mt-4 text-4xl font-black text-green-400">ONLINE</h2>
</div>

</div>

);
}
