import { Handler } from './handler';
import { Class } from "runtime/reflect/class";
import { Method } from "runtime/reflect/method";
import { Member } from "runtime/reflect/member";
export declare class RestRoute {
    static ACTIONS: string[];
    static isActionMethod(m: Member): boolean;
    method: Method;
    path: any;
    params: any;
    regexp: any;
    action: string;
    constructor(path: string, method: Method);
    match(path: any): any;
    execute(options: any, ...args: any[]): any;
    toJSON(): {
        method: string;
        path: any;
        params: any;
        regexp: any;
    };
    toString(): string;
}
export declare class RestHandler extends Handler {
    static routes: {
        [k: string]: RestRoute;
    };
    static register(path: any, resource: Class): void;
    private config;
    constructor();
    accept(req: any, res: any): void;
    handle(req: any, res: any): Promise<any>;
}
