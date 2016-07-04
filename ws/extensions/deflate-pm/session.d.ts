export declare class Session {
    protected _level: any;
    protected _memLevel: any;
    protected _strategy: any;
    protected _acceptNoContextTakeover: any;
    protected _acceptMaxWindowBits: any;
    protected _requestNoContextTakeover: any;
    protected _requestMaxWindowBits: any;
    protected _ownContextTakeover: any;
    protected _ownWindowBits: any;
    protected _peerWindowBits: any;
    protected _peerContextTakeover: any;
    protected _queueIn: any;
    protected _queueOut: any;
    protected _lockIn: any;
    protected _lockOut: any;
    protected _inflate: any;
    protected _deflate: any;
    constructor(options: any);
    processIncomingMessage(message: any, callback: any): any;
    processOutgoingMessage(message: any, callback: any): any;
    close(): void;
    protected _getInflate(): any;
    protected _getDeflate(): any;
    protected _close(codec: any): void;
}
