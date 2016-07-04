import { Base } from './base';
export declare class Server extends Base {
    static isWebSocket(request: any): boolean;
    static isSecureRequest(request: any): boolean;
    static determineUrl(request: any): string;
    static http(request: any, options?: any): Base;
    EVENTS: string[];
    method: string;
    headers: string;
    body: string;
    protocol: string;
    version: string;
    private _http;
    private _delegate;
    constructor(options: any);
    parse(chunk: any): any;
    protected _bindEventListeners(): void;
    protected _open(): void;
}
