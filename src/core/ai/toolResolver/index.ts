import { Tools } from "@/core/ai/tools";

export function resolveTool(id:string){
    return Tools.find(tool=>tool.id===id);
}
