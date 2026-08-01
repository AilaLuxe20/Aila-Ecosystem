const jobs=new Map<string,unknown>();

export function addJob(id:string,job:unknown){

    jobs.set(id,job);

}

export function getJob(id:string){

    return jobs.get(id);

}

export function getJobs(){

    return [...jobs.entries()];

}

export function removeJob(id:string){

    jobs.delete(id);

}
