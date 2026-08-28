import { AIConfig } from "@/core/ai/config";

export function resolveModel(model?:string){

    return model ?? AIConfig.defaultModel;

}
