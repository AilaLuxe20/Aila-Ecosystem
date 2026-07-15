const notifications=[
"Client requested an AI platform",
"Proposal accepted",
"Website deployed successfully",
"New document uploaded",
"Automation completed"
];

export default function NotificationCard(){

return(

<div className="rounded-3xl border border-white/10 bg-white/5 p-8">

<h2 className="mb-6 text-2xl font-bold">
Notifications
</h2>

<div className="space-y-4">

{notifications.map(item=>(

<div
key={item}
className="rounded-xl bg-black/20 p-4">

?? {item}

</div>

))}

</div>

</div>

);

}
