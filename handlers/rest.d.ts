import { Handler } from './handler';
export declare class RestRoute {
    static methods: string[];
    resource: any;
    action: any;
    private method;
    private path;
    private params;
    private regexp;
    constructor(resource: any, action: any, path: any);
    match(path: any): any;
    toJSON(): {
        method: any;
        path: any;
        resource: string;
        params: any;
        regexp: any;
    };
    toString(): string;
}
export declare class RestHandler extends Handler {
    static routes: any;
    static register(path: any, resource: any): void;
    private config;
    constructor();
    accept(req: any, res: any): void;
    handle(req: any, res: any): Promise<any>;
}
