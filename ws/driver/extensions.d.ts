import { Frame } from "./hybi/frame";
import { Pipeline } from "./pipeline";
export declare class Extensions {
    static MESSAGE_OPCODES: number[];
    protected _rsv1: any;
    protected _rsv2: any;
    protected _rsv3: any;
    protected _byName: any;
    protected _inOrder: any;
    protected _sessions: any;
    protected _index: any;
    protected _pipeline: Pipeline;
    constructor();
    add(ext: any): void;
    generateOffer(): string;
    activate(header: any): void;
    generateResponse(header: any): string;
    validFrameRsv(frame: Frame): boolean;
    processIncomingMessage(message: any, callback: any, context: any): void;
    processOutgoingMessage(message: any, callback: any, context: any): void;
    close(callback?: any, context?: any): any;
    _reserve(ext: any): void;
    _reserved(ext: any): any;
}
