"use client";

export default function VoiceInput(){

return(

<div className="rounded-3xl border border-white/10 bg-white/5 p-8">

<h2 className="text-2xl font-black">
Voice Conversation
</h2>

<div className="mt-10 flex justify-center">

<button className="flex h-28 w-28 items-center justify-center rounded-full bg-cyan-500 text-5xl shadow-[0_0_80px_#22d3ee] transition hover:scale-110">

???

</button>

</div>

<p className="mt-8 text-center text-slate-400">

Tap the microphone to begin talking with Aila.

</p>

</div>

);

}
