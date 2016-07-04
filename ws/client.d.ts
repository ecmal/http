import { API } from "./api";
export declare class Client extends API {
    headers: any;
    statusCode: number;
    constructor(_url: any, protocols: any, options: any);
    protected _onConnect(): void;
    protected _configureProxy(proxy: any, originTLS: any): void;
}
