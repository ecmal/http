import {URL} from "@ecmal/node/url";
import {HttpServerRequest,HttpServerResponse} from "./server";

export class Resource {
    readonly url       : URL;
    readonly params    : any;
    readonly request   : HttpServerRequest;
    readonly response  : HttpServerResponse;
    public get query(){
        let query = {};
        this.url.searchParams.forEach((v:string,n:string)=>{
            query[n]=v;
        })
        return query;
    }
}