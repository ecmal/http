export declare class Message {
    rsv1: boolean;
    rsv2: boolean;
    rsv3: boolean;
    opcode: number;
    length: number;
    data: Buffer;
    private _chunks;
    constructor();
    read(): Buffer;
    pushFrame(frame: any): void;
}
