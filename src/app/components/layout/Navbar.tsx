"use client";

import Link from "next/link";
import { useState } from "react";
import { Menu, X } from "lucide-react";
import MobileMenu from "./MobileMenu";
import { navigation } from "./Navigation";

export default function Navbar() {

  const [open,setOpen]=useState(false);

  return(

<header className="fixed inset-x-0 top-0 z-50">

<div className="mx-auto mt-6 max-w-7xl px-6">

<div className="glass flex items-center justify-between rounded-full px-8 py-5">

<Link
href="/"
className="text-3xl font-black tracking-tight"
>

<span className="bg-gradient-to-r from-cyan-400 to-violet-400 bg-clip-text text-transparent">

AILA

</span>

</Link>

<nav className="hidden gap-10 lg:flex">

{navigation.map(item=>(

<Link
key={item.href}
href={item.href}
className="text-white/70 transition hover:text-white"
>

{item.label}

</Link>

))}

</nav>

<button
onClick={()=>setOpen(!open)}
className="lg:hidden"
>

{open?<X/>:<Menu/>}

</button>

</div>

<MobileMenu
open={open}
close={()=>setOpen(false)}
navigation={navigation}
/>

</div>

</header>

);

}