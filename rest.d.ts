export declare function Rest(path: any): (resource: any) => void;
export declare class Result {
    value: any;
    status: any;
    headers: any;
    static create(value: any, status?: number, headers?: {}): Result;
    constructor(value: any, status?: number, headers?: {});
}
