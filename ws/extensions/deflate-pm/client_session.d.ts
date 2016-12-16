import { Session } from './session';
export declare class ClientSession extends Session {
    static validParams(params: any): boolean;
    constructor(options: any);
    generateOffer(): any;
    activate(params: any): boolean;
}
