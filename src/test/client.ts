import { HttpClient } from "../common/client";
import { HttpServer } from "../common/server";
import { HttpRequest } from "../common/request";

class ServerError extends Error{
    hello():this{return this}
}

export async function main() {




    let server = new HttpServer();

    try {
        await server.listen({
            port: 8080,
            host: '0.0.0.0'
        })
    }catch(ex){
        throw new ServerError('Additional Info').cause().gago = 55
    }
    
    let client = new HttpClient();
    await client.connect({
        port : 8080,
        host : '0.0.0.0'
    })

    let request = new HttpRequest({client});
    let response = await request.sendHead({
        method: 'GET',
        path: '/hello/world?hello=world',
        headers: {
            Host: 'localhost:8080',
            ContentˆLength: '17'
        }
    }); // response
    
    await request.sendBody({
        hello: 'World'
    });
    
    // response + body
    await response.read();

    while (response.done){
        await response.chunk()
    }
       
    await client.execute(request)
}