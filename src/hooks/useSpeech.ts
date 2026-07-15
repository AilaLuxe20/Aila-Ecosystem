"use client";

export function useSpeech(){

function speak(text:string){

if(typeof window==="undefined") return;

window.speechSynthesis.cancel();

const utterance=new SpeechSynthesisUtterance(text);

utterance.rate=1;
utterance.pitch=1;
utterance.volume=1;

const voices=window.speechSynthesis.getVoices();

const preferred=
voices.find(v=>v.lang.startsWith("en")&&v.name.toLowerCase().includes("female"))||
voices.find(v=>v.lang.startsWith("en"))||
voices[0];

if(preferred){

utterance.voice=preferred;

}

window.speechSynthesis.speak(utterance);

}

function stop(){

window.speechSynthesis.cancel();

}

return{

speak,
stop

};

}
