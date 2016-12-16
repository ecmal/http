export declare class Functor {
    static QUEUE_SIZE: number;
    pending: any;
    protected _session: any;
    protected _method: any;
    protected _queue: any;
    protected _stopped: any;
    constructor(session: any, method: any);
    call(error: any, message: any, callback: any, context: any): void;
    protected _stop(): void;
    protected _flushQueue(): void;
}
