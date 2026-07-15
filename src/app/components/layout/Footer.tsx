"use client";

import Link from "next/link";

export default function Footer(){

return(

<footer className="border-t border-white/10 py-20">

<div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-8 px-6 lg:flex-row">

<div>

<h2 className="text-4xl font-black">

AILA

</h2>

<p className="mt-3 text-white/50">

Building the Future with AI.

</p>

</div>

<div className="flex gap-8">

<Link href="/">Home</Link>

<Link href="/products">Products</Link>

<Link href="/services">Services</Link>

<Link href="/contact">Contact</Link>

</div>

</div>

</footer>

);

}