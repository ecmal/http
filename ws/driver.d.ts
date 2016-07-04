import { Base } from './driver/base';
import { Client } from './driver/client';
import { Server } from './driver/server';
export declare class Driver {
    static client(url: any, options?: any): Client;
    static server(options?: any): Server;
    static http(request: any, options?: any): Base;
    static isSecureRequest(request: any): boolean;
    static isWebSocket(request: any): boolean;
    static validateOptions(options: any, validKeys: any): void;
}
