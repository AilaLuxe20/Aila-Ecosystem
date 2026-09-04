const queue: unknown[] = [];

export function enqueue(item: unknown) {
    queue.push(item);
    return queue.length;
}

export function dequeue() {
    return queue.shift();
}

export function getQueue() {
    return queue;
}
