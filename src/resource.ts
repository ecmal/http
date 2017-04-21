import {Url} from "@ecmal/node/url";
import {HttpServerRequest,HttpServerResponse} from "./server";

export class Resource {
    readonly url       : Url;
    readonly params    : any;
    readonly request   : HttpServerRequest;
    readonly response  : HttpServerResponse;
    public get query(){
        return this.url.query
    }
}