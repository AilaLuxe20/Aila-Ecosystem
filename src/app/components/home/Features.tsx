"use client";

import {
BrainCircuit,
ShieldCheck,
Zap,
Globe,
Sparkles,
Cpu
} from "lucide-react";

import FeatureCard from "../ui/FeatureCard";

const features=[
[BrainCircuit,"AI","Enterprise Intelligence"],
[ShieldCheck,"Security","Enterprise security"],
[Cpu,"Technology","Modern stack"],
[Zap,"Performance","Lightning fast"],
[Globe,"Global","Worldwide deployment"],
[Sparkles,"Luxury","Premium UI"],
] as const;

export default function Features(){

return(

<section className="py-32">

<div className="grid gap-8 md:grid-cols-2 xl:grid-cols-3">

{features.map(([icon,title,description])=>(

<FeatureCard
key={title}
icon={icon}
title={title}
description={description}
/>

))}

</div>

</section>

);

}