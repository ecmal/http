import { Decorator } from "runtime/decorators";
import { Member } from "runtime/reflect/member";
export declare class Path extends Decorator {
    path: string;
    constructor(path: any, options?: any);
    decorate(member: Member): void;
}
export declare class Rest extends Path {
    constructor(path: string, options?: any);
    decorate(member: Member): void;
}
export declare class WebSocket extends Path {
    options: any;
    constructor(path: string, options?: any);
    decorate(member: Member): void;
}
export declare class Result {
    value: any;
    status: any;
    headers: any;
    static create(value: any, status?: number, headers?: {}): Result;
    constructor(value: any, status?: number, headers?: {});
}
