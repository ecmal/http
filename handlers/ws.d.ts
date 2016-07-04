import { Handler } from "./handler";
import { Class } from "runtime/reflect/class";
import { RestRoute } from "./rest";
export declare class WebSocketHandler extends Handler {
    static routes: {
        [k: string]: RestRoute;
    };
    static register(path: any, resource: Class): void;
    constructor();
    getRoute(request: any, socket: any, body: any): any;
}
