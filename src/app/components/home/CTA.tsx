"use client";

import GlowButton from "../ui/GlowButton";

export default function CTA(){

return(

<section className="py-32">

<div className="rounded-[40px] border border-cyan-500/20 bg-gradient-to-br from-cyan-500/10 to-violet-500/10 p-20 text-center">

<h2 className="text-6xl font-black">

Build With Aila

</h2>

<p className="mx-auto mt-8 max-w-3xl text-slate-400 leading-9">

Artificial Intelligence.
Enterprise Software.
Automation.

</p>

<div className="mt-12">

<GlowButton href="/contact">

Start Your Project

</GlowButton>

</div>

</div>

</section>

);

}