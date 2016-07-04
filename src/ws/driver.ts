import {Base} from './driver/base';
import {Client} from './driver/client';
import {Server} from './driver/server';

export class Driver {
    static client (url, options?):Client {
        return new Client(url, options);
    }
    static server(options?):Server {
        return new Server(options);
    }
    static http(request, options?) {
        return Server.http(request, options);
    }
    static isSecureRequest(request) {
        return Server.isSecureRequest(request);
    }
    static isWebSocket(request) {
        return Server.isWebSocket(request);
    }
    static validateOptions(options, validKeys) {
        Base.validateOptions(options, validKeys);
    }
}

