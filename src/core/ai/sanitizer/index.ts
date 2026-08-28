export function sanitizePrompt(text:string){

    return text.replace(/\s+/g," ").trim();

}
