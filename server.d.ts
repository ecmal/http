export declare class Server {
    static initResponse(res: any): void;
    static initRequest(req: any): void;
    static handlers: any;
    static handler(name: any): (handler: any) => void;
    handlers: any;
    config: any;
    server: any;
    constructor(config: any);
    start(): this;
    doRequest(req: any, res: any): Promise<{}>;
}
