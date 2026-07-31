export function buildPrompt(system:string,user:string){
    return `${system}

${user}`;
}
