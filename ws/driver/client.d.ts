import { Hybi } from "./hybi";
import { Proxy } from "./proxy";
import { HttpParser } from "./http_parser";
export declare class Client extends Hybi {
    static generateKey(): string;
    version: string;
    _key: string;
    _pathname: string;
    _protocols: string[];
    _accept: string;
    _http: HttpParser;
    VALID_PROTOCOLS: string[];
    statusCode: number;
    headers: number;
    constructor(_url: any, options: any);
    proxy(origin: any, options: any): Proxy;
    start(): boolean;
    parse(chunk: any): any;
    protected _handshakeRequest(): Buffer;
    protected _failHandshake(message: any): void;
    protected _validateHandshake(): void;
}
