export async function* createStream(text:string){

    const words=text.split(" ");

    for(const word of words){

        yield{
            content:word+" ",
            done:false
        };

    }

    yield{
        content:"",
        done:true
    };

}
