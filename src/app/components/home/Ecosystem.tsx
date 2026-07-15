"use client";

import {
BrainCircuit,
Scale,
Bot,
Globe,
Smartphone,
Briefcase
} from "lucide-react";

import ProductCard from "../ui/ProductCard";

const items=[
{
icon:Scale,
title:"AilaLegal",
description:"AI legal assistant",
href:"/products/ailalegal"
},
{
icon:BrainCircuit,
title:"Aila Intelligence",
description:"Enterprise AI",
href:"/products/intelligence"
},
{
icon:Briefcase,
title:"Business",
description:"Business OS",
href:"/products/business"
},
{
icon:Bot,
title:"Automation",
description:"AI automation",
href:"/products/automation"
},
{
icon:Globe,
title:"Sites",
description:"Luxury websites",
href:"/products/sites"
},
{
icon:Smartphone,
title:"Apps",
description:"iOS & Android",
href:"/products/apps"
}
];

export default function Ecosystem(){

return(

<section className="py-32">

<div className="grid gap-8 lg:grid-cols-3">

{items.map(item=>(

<ProductCard
key={item.title}
{...item}
/>

))}

</div>

</section>

);

}