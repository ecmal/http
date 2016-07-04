import { Stream } from "node/stream";
export declare class Proxy extends Stream {
    readable: any;
    writable: any;
    statusCode: any;
    headers: any;
    private _client;
    private _http;
    private _origin;
    private _url;
    private _options;
    private _state;
    private _paused;
    private _headers;
    constructor(client: any, origin: any, options: any);
    setHeader(name: any, value: any): boolean;
    start(): boolean;
    pause(): void;
    resume(): void;
    write(chunk: any): boolean;
    end(chunk?: any): void;
    destroy(): void;
}
