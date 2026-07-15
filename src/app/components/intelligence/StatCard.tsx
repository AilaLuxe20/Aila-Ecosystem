type Props={
title:string;
value:string;
};

export default function StatCard({title,value}:Props){

return(

<div className="rounded-2xl border border-white/10 bg-white/5 p-6">

<p className="text-slate-400">
{title}
</p>

<h2 className="mt-4 text-4xl font-black">
{value}
</h2>

</div>

);

}
