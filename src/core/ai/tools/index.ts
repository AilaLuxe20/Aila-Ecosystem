export interface Tool{
    id:string;
    name:string;
    description:string;
}

export const Tools:Tool[]=[
    {
        id:"chat",
        name:"Chat",
        description:"General AI conversation"
    },
    {
        id:"document",
        name:"Document Analysis",
        description:"Analyze uploaded documents"
    },
    {
        id:"legal",
        name:"Legal Assistant",
        description:"Legal reasoning"
    }
];
