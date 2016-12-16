import { Hybi } from "./driver/hybi";
export declare class Socket {
    static connections: Set<Socket>;
    static isWebSocket(request: any): boolean;
    protected path: any;
    protected query: any;
    protected headers: any;
    protected params: any;
    protected driver: Hybi;
    protected id: string;
    protected extensions: any[];
    constructor(request?: any, socket?: any, body?: any, options?: any);
    protected accept(): any;
    protected start(request?: any, socket?: any, body?: any, options?: any): void;
    send(message: any): void;
    text(message: string): boolean;
    binary(message: Buffer): boolean;
    ping(message: any, callback?: any): boolean;
    pong(message: any): boolean;
    close(reason?: any, code?: any): boolean;
    protected onOpen(id: string): void;
    protected onMessage(data: any): void;
    protected onClose(id: string): void;
    protected onError(error: any): void;
    protected toJSON(): {
        id: string;
        path: any;
        params: any;
        query: any;
        headers: any;
    };
}
