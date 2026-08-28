type EventPayload=unknown;

const listeners=new Map<string,((payload:EventPayload)=>void)[]>();

export function emit(event:string,payload:EventPayload){

    (listeners.get(event) ?? []).forEach(listener=>listener(payload));

}

export function on(event:string,listener:(payload:EventPayload)=>void){

    listeners.set(

        event,

        [...(listeners.get(event) ?? []),listener]

    );

}
