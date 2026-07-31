export function resolveAgent(mode:string){

    switch(mode){

        case "legal":
        case "business":
        case "automation":
            return mode;

        default:
            return "intelligence";
    }

}
