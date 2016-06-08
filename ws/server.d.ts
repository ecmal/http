import { Server } from "node/http";
import { EventEmitter } from "node/events";
import { IncomingMessage } from "node/http";
import { WsConnection } from "./connection";
export declare class WsServer extends EventEmitter {
    static create(server: Server, protocol: string): WsServer;
    static inject(server: Server, protocol: string): WsServer;
    protocol: string;
    connections: {
        [id: string]: WsConnection;
    };
    constructor(server: Server, protocol: string);
    protected newConnection(): WsConnection;
    protected doUpgrade(req: IncomingMessage): void;
    private response(socket, status, message, headers?, body?);
}
