export declare class RingBuffer {
    length: number;
    private _buffer;
    private _bufferSize;
    private _ringOffset;
    private _ringSize;
    private _head;
    private _tail;
    constructor(bufferSize: any);
    push(value: any): void;
    peek(): any;
    shift(): any;
}
