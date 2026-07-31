import { createStream } from "@/core/ai/streaming";

export async function POST(req:Request){

    const {text=""}=await req.json();

    const encoder=new TextEncoder();

    const stream=new ReadableStream({

        async start(controller){

            for await(const chunk of createStream(text)){

                controller.enqueue(
                    encoder.encode(chunk.content)
                );

            }

            controller.close();

        }

    });

    return new Response(stream,{
        headers:{
            "Content-Type":"text/plain"
        }
    });

}
