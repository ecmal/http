import { Socket } from "node/net";
import { EventEmitter } from "node/events";
import { IncomingMessage } from "node/http";
export declare enum WsOpCode {
    CHUNK = 0,
    TEXT = 1,
    BINARY = 2,
    CLOSE = 8,
    PING = 9,
    PONG = 10,
}
export declare enum WsState {
    CONNECTING = 0,
    OPEN = 1,
}
export declare class WsFrame {
    static MAX_SIZE: number;
    static decode(data: Buffer, isServer: boolean): WsFrame;
    static createFrames(op: WsOpCode, data: Buffer, handler: (b: Buffer) => void): void;
    static createFrame(op: WsOpCode, data: Buffer, fin?: boolean, masked?: boolean): Buffer;
    static createMetaData(fin: boolean, opcode: WsOpCode, masked: boolean, payload: Buffer): any;
    fin: boolean;
    op: WsOpCode;
    data: Buffer;
    size: number;
    code: number;
    constructor(fin: boolean, opcode: WsOpCode, payload: Buffer, size: number);
    inspect(): {
        fin: boolean;
        op: WsOpCode;
        size: number;
        length: number;
    };
}
export declare class WsError extends Error {
    code: number;
    constructor(code: any, message: any);
    toString(): string;
}
export declare class WsConnection extends EventEmitter {
    protected server: boolean;
    protected state: WsState;
    protected headers: any;
    protected socket: Socket;
    private reading;
    private readingBuffer;
    private queue;
    version: string;
    origin: string;
    key: string;
    id: string;
    hash: string;
    protocols: string[];
    private ping;
    private pinger;
    constructor(isServer: boolean);
    connect(): boolean;
    accept(request: IncomingMessage, protocol: string): boolean;
    protected onFrame(frame: WsFrame): void;
    protected onText(buffer: Buffer): void;
    protected onBinary(buffer: Buffer): void;
    protected onPong(buffer: Buffer): void;
    protected onPing(buffer: Buffer): void;
    protected onClose(buffer: Buffer): void;
    protected onStreamBinary(buffer: Buffer): void;
    protected onStreamText(buffer: Buffer): void;
    protected onStreamChunk(buffer: Buffer): void;
    protected onStreamDone(buffer: Buffer): void;
    protected sendFrame(op: WsOpCode, data: Buffer): void;
    protected sendPing(): void;
    sendText(text: string): void;
    sendBinary(buffer: Buffer): void;
}
