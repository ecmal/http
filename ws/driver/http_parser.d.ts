export declare class HttpParser {
    static METHODS: {
        0: string;
        1: string;
        2: string;
        3: string;
        4: string;
        5: string;
        6: string;
        7: string;
        8: string;
        9: string;
        10: string;
        11: string;
        12: string;
        13: string;
        14: string;
        15: string;
        16: string;
        17: string;
        18: string;
        19: string;
        24: string;
    };
    private _parser;
    private _type;
    private _complete;
    headers: any;
    method: string;
    url: string;
    body: any;
    statusCode: number;
    constructor(type: any);
    isComplete(): any;
    parse(chunk: any): void;
}
