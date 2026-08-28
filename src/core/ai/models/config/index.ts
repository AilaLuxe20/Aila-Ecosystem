import { AIConfig } from "@/core/ai/config";

export function getDefaultModel(){

    return AIConfig.defaultModel;

}

export function getTemperature(){

    return AIConfig.temperature;

}

export function getMaxTokens(){

    return AIConfig.maxTokens;

}
