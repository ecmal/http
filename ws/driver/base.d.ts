import { EventEmitter } from 'node/events';
import { IO, Messages } from './streams';
import { StreamReader } from './stream_reader';
export declare class ConnectEvent {
}
export declare class OpenEvent {
}
export declare class CloseEvent {
    code: number;
    reason: string;
    constructor(code: any, reason: any);
}
export declare class MessageEvent {
    data: any;
    constructor(data: any);
}
export declare class Base extends EventEmitter {
    static ConnectEvent: typeof ConnectEvent;
    static OpenEvent: typeof OpenEvent;
    static CloseEvent: typeof CloseEvent;
    static MessageEvent: typeof MessageEvent;
    static validateOptions(options: any, validKeys: any): void;
    MAX_LENGTH: number;
    STATES: string[];
    readyState: any;
    url: any;
    version: string;
    io: IO;
    messages: Messages;
    protocol: string;
    headers: any;
    statusCode: number;
    protected _request: any;
    protected _reader: StreamReader;
    protected _options: any;
    protected _maxLength: any;
    protected _headers: any;
    protected _stage: any;
    protected __queue: any;
    constructor(request: any, url: any, options: any);
    parse(chunk: any): void;
    proxy(origin: any, options?: any): void;
    getState(): string;
    addExtension(extension: any): boolean;
    setHeader(name: any, value: any): boolean;
    start(): boolean;
    text(message: any): void;
    binary(message: any): boolean;
    ping(message?: any, callback?: any): boolean;
    pong(message?: any): boolean;
    close(reason: any, code: any): boolean;
    frame(buffer: any, type?: any, code?: any): void;
    protected _handshakeResponse(): void;
    protected _bindEventListeners(): void;
    protected _open(): void;
    protected _queue(message: any): boolean;
    protected _write(chunk: any): void;
}
