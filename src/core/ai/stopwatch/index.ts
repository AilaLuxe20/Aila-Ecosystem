export function startTimer(){

    return performance.now();

}

export function stopTimer(start:number){

    return performance.now()-start;

}
