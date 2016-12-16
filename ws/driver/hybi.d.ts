import { Base } from "./base";
import { Extensions } from "./extensions";
import { Frame } from "./hybi/frame";
import { Message } from "./hybi/message";
export declare class Hybi extends Base {
    static GUID: string;
    static mask(payload: any, mask: any, offset?: any): any;
    static generateAccept(key: any): any;
    FIN: number;
    MASK: number;
    RSV1: number;
    RSV2: number;
    RSV3: number;
    OPCODE: number;
    LENGTH: number;
    OPCODES: {
        continuation: number;
        text: number;
        binary: number;
        close: number;
        ping: number;
        pong: number;
    };
    OPCODE_CODES: number[];
    MESSAGE_OPCODES: number[];
    OPENING_OPCODES: number[];
    ERRORS: {
        normal_closure: number;
        going_away: number;
        protocol_error: number;
        unacceptable: number;
        encoding_error: number;
        policy_violation: number;
        too_large: number;
        extension_error: number;
        unexpected_condition: number;
    };
    ERROR_CODES: number[];
    DEFAULT_ERROR_CODE: number;
    MIN_RESERVED_ERROR: number;
    MAX_RESERVED_ERROR: number;
    UTF8_MATCH: RegExp;
    key: string;
    protocol: string;
    version: string;
    protected _extensions: Extensions;
    protected _masking: any;
    protected _protocols: string[];
    protected _requireMasking: any;
    protected _pingCallbacks: any;
    protected _frame: Frame;
    protected _message: Message;
    constructor(request: any, url: any, options: any);
    addExtension(extension: any): boolean;
    parse(chunk: any): void;
    text(message: any): boolean;
    binary(message: any): boolean;
    ping(message: any, callback?: any): boolean;
    pong(message: any): boolean;
    close(reason?: any, code?: any): boolean;
    frame(buffer: any, type?: any, code?: any): boolean;
    protected _sendFrame(frame: any): void;
    protected _handshakeResponse(): any;
    protected _shutdown(code: any, reason: any, error?: any): void;
    protected _fail(type: any, message: any): void;
    protected _parseOpcode(octet: any): void;
    protected _parseLength(octet: any): void;
    protected _parseExtendedLength(buffer: any): void;
    protected _checkFrameLength(): boolean;
    protected _emitFrame(buffer: any): void;
    protected _emitMessage(message: any): void;
    protected _encode(buffer: any): any;
    protected _readUInt(buffer: any): any;
}
