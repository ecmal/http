import { Session } from './session';
export declare class ServerSession extends Session {
    static validParams(params: any): boolean;
    protected _params: any;
    constructor(options: any, params: any);
    generateResponse(): any;
}
