export declare class Offers {
    private _byName;
    private _inOrder;
    constructor();
    push(name: any, params: any): void;
    eachOffer(callback: any, context: any): void;
    byName(name: any): any;
    toArray(): any;
}
export declare class Parser {
    static parseHeader(header: any): Offers;
    static serializeParams(name: any, params: any): string;
}
