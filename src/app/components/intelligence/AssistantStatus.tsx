export default function AssistantStatus(){

return(

<div className="rounded-3xl border border-cyan-500/20 bg-cyan-500/10 p-8">

<h2 className="text-2xl font-black">
Assistant Status
</h2>

<div className="mt-8 space-y-4">

<div className="flex justify-between">
<span>Brain</span>
<span className="text-green-400">Connected</span>
</div>

<div className="flex justify-between">
<span>Speech</span>
<span className="text-green-400">Ready</span>
</div>

<div className="flex justify-between">
<span>Realtime</span>
<span className="text-green-400">Active</span>
</div>

<div className="flex justify-between">
<span>Knowledge</span>
<span className="text-green-400">Loaded</span>
</div>

<div className="flex justify-between">
<span>Memory</span>
<span className="text-green-400">Learning</span>
</div>

</div>

</div>

);

}
