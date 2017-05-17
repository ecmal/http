import {HttpClient,HttpRequest,HttpRequestOptions,HttpResponse} from "@ecmal/http/index";
export class Client extends HttpClient {

    async request(options:HttpRequestOptions){
        let request = new HttpRequest(options,HttpResponse,this);
        return await request.send();
    }

    async nestedRoute(options:HttpRequestOptions){
        let request = new HttpRequest(options,HttpResponse,this);
        request.setPath('/hello/hello');
        let response = await request.send();
        return response.json();
    }

}

export const client = new Client();

