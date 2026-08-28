const OPENROUTER_URL="https://openrouter.ai/api/v1/chat/completions";

export async function openRouterChat(body:unknown){

    const response=await fetch(OPENROUTER_URL,{

        method:"POST",

        headers:{
            Authorization:`Bearer ${process.env.OPENROUTER_API_KEY}`,
            "Content-Type":"application/json"
        },

        body:JSON.stringify(body)

    });

    if(!response.ok){

        throw new Error(await response.text());

    }

    return response.json();

}
