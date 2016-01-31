export declare class Client {
    private protocol;
    private host;
    private port;
    private path;
    private headers;
    private streamed;
    private service;
    constructor(url: any, headers: any);
    configure(url: any, headers: any): void;
    initRequest(req: any): any;
    initResponse(req: any, res: any): any;
    encode(req: any): any;
    decode(res: any): any;
    onRequest(req: any): void;
    onSuccess(req: any, res: any): void;
    onFailure(req: any, err: any): void;
    request(req: any): Promise<{}>;
}
