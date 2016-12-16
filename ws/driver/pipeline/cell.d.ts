export declare class Cell {
    protected _ext: any;
    protected _session: any;
    protected _functors: any;
    protected _closed: any;
    constructor(tuple: any);
    pending(direction: any): void;
    incoming(error: any, message: any, callback: any, context: any): void;
    outgoing(error: any, message: any, callback: any, context: any): void;
    close(): any;
    protected _exec(direction: any, error: any, message: any, callback: any, context: any): void;
    protected _doClose(): void;
}
