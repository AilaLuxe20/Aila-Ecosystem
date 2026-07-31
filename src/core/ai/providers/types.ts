export interface AIProvider{

    name:string;

    chat(messages:unknown[]):Promise<unknown>;

}
