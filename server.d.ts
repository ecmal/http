import { Emitter } from "runtime/events";
export declare class Server extends Emitter {
    static initResponse(res: any): void;
    static initRequest(req: any): void;
    static handlers: any;
    static handler(name: any): (handler: any) => void;
    handlers: any;
    config: any;
    server: any;
    constructor(config: any);
    start(): this;
    protected doRequest(req: any, res: any): Promise<{}>;
    protected doUpgrade(req: any, socket: any, body: any): void;
}
