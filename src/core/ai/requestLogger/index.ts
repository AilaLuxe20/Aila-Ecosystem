const requests:any[]=[];

export function logRequest(request:any){

    requests.push({

        timestamp:new Date().toISOString(),

        request

    });

}

export function getRequests(){

    return requests;

}
