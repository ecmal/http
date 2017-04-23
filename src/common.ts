import {Url as NodeUrl} from "@ecmal/node/url"

export interface Url extends NodeUrl{
    params : any
}
export interface HttpHeaders {
    [key: string]: any;
}
export interface HttpQuery {
    [key: string]: any;
}
export type HttpMethods = "GET" | "POST" | "DELETE" | "PUT";
