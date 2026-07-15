export default function RealtimeStatus(){

return(

<div className="rounded-3xl border border-green-500/20 bg-green-500/10 p-8">

<p className="text-green-400 uppercase tracking-[0.4em]">
Realtime Status
</p>

<div className="mt-8 space-y-4">

<div className="flex justify-between">
<span>AI</span>
<span className="text-green-400">ONLINE</span>
</div>

<div className="flex justify-between">
<span>Voice</span>
<span className="text-green-400">READY</span>
</div>

<div className="flex justify-between">
<span>Vision</span>
<span className="text-green-400">READY</span>
</div>

<div className="flex justify-between">
<span>Memory</span>
<span className="text-green-400">ACTIVE</span>
</div>

</div>

</div>

);

}
