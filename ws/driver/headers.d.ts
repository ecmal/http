export declare class Headers {
    ALLOWED_DUPLICATES: string[];
    private _sent;
    private _lines;
    constructor();
    clear(): void;
    set(name: any, value: any): void;
    toString(): any;
    private _strip(string);
}
