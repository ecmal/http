export declare class Pipeline {
    private _cells;
    private _stopped;
    constructor(sessions: any);
    processIncomingMessage(message: any, callback: any, context: any): void;
    processOutgoingMessage(message: any, callback: any, context: any): void;
    close(callback: any, context: any): void;
    protected _loop(direction: any, start: any, end: any, step: any, message: any, callback: any, context: any): void;
}
