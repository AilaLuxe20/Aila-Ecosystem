export function getRuntimeContext(){

    return{

        node:process.version,

        environment:process.env.NODE_ENV,

        platform:process.platform

    };

}
