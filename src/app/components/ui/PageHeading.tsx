"use client";

import GradientText from "./GradientText";

export default function PageHeading({
title,
subtitle,
}:{
title:string;
subtitle:string;
}){

return(

<div className="mb-24 text-center">

<h1 className="text-6xl font-black">

<GradientText>

{title}

</GradientText>

</h1>

<p className="mx-auto mt-8 max-w-3xl text-lg leading-9 text-slate-400">

{subtitle}

</p>

</div>

);

}