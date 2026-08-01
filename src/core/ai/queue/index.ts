const queue:any[]=[];

export function enqueue(item:any){

    queue.push(item);

    return queue.length;

}

export function dequeue(){

    return queue.shift();

}

export function getQueue(){

    return queue;

}
