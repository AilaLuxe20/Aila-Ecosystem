const files=[
"BusinessProposal.pdf",
"Contract.docx",
"AIArchitecture.pdf",
"LandingPage.fig",
"Automation.json",
];

export default function RecentFiles(){

return(

<div className="rounded-3xl border border-white/10 bg-white/5 p-8">

<h2 className="mb-8 text-2xl font-black">
Recent Files
</h2>

<div className="space-y-4">

{files.map(file=>(

<div
key={file}
className="rounded-xl bg-black/20 p-4">

?? {file}

</div>

))}

</div>

</div>

);

}
