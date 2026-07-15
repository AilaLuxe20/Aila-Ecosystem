"use client";

import { LucideIcon } from "lucide-react";
import Card from "./Card";

export default function FeatureCard({
icon:Icon,
title,
description,
}:{
icon:LucideIcon;
title:string;
description:string;
}){

return(

<Card className="p-10">

<div className="mb-8 inline-flex rounded-2xl bg-cyan-500/10 p-5">

<Icon className="h-8 w-8 text-cyan-400"/>

</div>

<h3 className="text-2xl font-black">

{title}

</h3>

<p className="mt-5 leading-8 text-slate-400">

{description}

</p>

</Card>

);

}