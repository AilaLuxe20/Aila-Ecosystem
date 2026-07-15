"use client";

import { useRef } from "react";

export function useStream() {

const controller=useRef<AbortController|null>(null);

function cancel(){

controller.current?.abort();

}

async function stream(
url:string,
body:unknown,
onChunk:(chunk:string)=>void
){

controller.current=new AbortController();

const response=await fetch(url,{
method:"POST",
headers:{
"Content-Type":"application/json"
},
body:JSON.stringify(body),
signal:controller.current.signal
});

if(!response.body){

throw new Error("Streaming is not supported.");

}

const reader=response.body.getReader();

const decoder=new TextDecoder();

while(true){

const{
done,
value
}=await reader.read();

if(done){

break;

}

const chunk=decoder.decode(value,{
stream:true
});

onChunk(chunk);

}

}

return{

stream,
cancel

};

}
