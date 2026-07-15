type Props={

role:"assistant"|"user";
message:string;

};

export default function MessageBubble({

role,
message

}:Props){

const assistant=role==="assistant";

return(

<div className={assistant?"flex":"flex justify-end"}>

<div
className={
assistant
?"max-w-xl rounded-3xl bg-cyan-500/10 p-5"
:"max-w-xl rounded-3xl bg-blue-600/20 p-5"
}>

<p className="text-slate-200 leading-8">

{message}

</p>

</div>

</div>

);

}
