import {HttpClient,HttpRequest,HttpRequestOptions,HttpResponse} from "@ecmal/http/index";
export class Client extends HttpClient {
    async test(options:HttpRequestOptions){
        let request = new HttpRequest(options,HttpResponse,this);
        request.setPath('/test.json');
        let response = await request.send();
        return response.json();
    }
}

export const client = new Client();