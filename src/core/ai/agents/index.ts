export interface Agent{
    id:string;
    name:string;
    description:string;
}

const agents:Agent[]=[
    {
        id:"intelligence",
        name:"Aila Intelligence",
        description:"General intelligence"
    },
    {
        id:"legal",
        name:"AilaLegal",
        description:"Legal AI"
    },
    {
        id:"business",
        name:"Business AI",
        description:"Business advisor"
    },
    {
        id:"automation",
        name:"Automation AI",
        description:"Workflow automation"
    }
];

export function getAgents(){
    return agents;
}
