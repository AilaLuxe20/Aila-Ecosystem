let requests=0;

export function incrementRequests(){
    requests++;
}

export function getRequestCount(){
    return requests;
}
