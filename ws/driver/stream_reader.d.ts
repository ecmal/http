export declare class StreamReader {
    private _queue;
    private _queueSize;
    private _offset;
    constructor();
    put(buffer: any): void;
    read(length: any): any;
    eachByte(callback: any, context: any): void;
    private _concat(buffers, length);
}
