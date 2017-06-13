import { HttpParserBinding } from "./binding"
import { Emitter } from "@ecmal/runtime/events";
import { HttpRequest } from "./request";
import { HttpResponse } from "./response";

export class HttpParser extends Emitter {
    private binding: HttpParserBinding;
    constructor(type: number) {
        super();
        this.binding = new HttpParserBinding(type)
        this.binding[HttpParserBinding.kOnHeaders] = function (...args) {
            console.info("Headers", ...args);
        }
        this.binding[HttpParserBinding.kOnHeadersComplete] = (
            maj, min, head, m, url, status, message, upgrade, alive
        ) => {
            let method = HttpParserBinding.METHODS[m];
            let version = `${maj}.${min}`
            let headers = new Map();
            for (var i = 0; i < head.length; i += 2) {
                headers.set(head[i], head[i + 1]);
            }
            switch (type) {
                case HttpParserBinding.REQUEST: return this.emit('head', this.buildRequest({
                    method, version, url, upgrade, alive, headers
                }))
                case HttpParserBinding.RESPONSE: return this.emit('head', this.buildResponse({
                    version, status, message, upgrade, alive, headers
                }))
                default: throw new Error('invlid type')
            }
        }
        this.binding[HttpParserBinding.kOnBody] = (body, headSize, bodySize) => {
            this.emit('body', {
                body, bodySize, headSize
            });
        }
        this.binding[HttpParserBinding.kOnMessageComplete] = () => {
            this.emit('done');
        }
    }
    protected buildRequest(msg: any): any {
        return msg;
    }
    protected buildResponse(msg: any): any {
        return msg;
    }
    close() { }
    execute(data: Uint8Array) {
        return this.binding.execute(data);
    }
    finish() { }
    reinitialize() { }
    pause() {
        return this.binding.pause()
    }
    resume() { 
        return this.binding.resume()
    }
    consume() { }
    unconsume() { }
    getCurrentBuffer() {
        return this.binding.getCurrentBuffer();
     }
}
export class HttpRequestParser extends HttpParser {
    constructor() {
        super(HttpParserBinding.REQUEST);
    }
    protected buildRequest(msg: any): any {
        return HttpRequest.call(
            Object.setPrototypeOf(
                HttpRequest.prototype,
                Object.defineProperty(msg, 'constructor', {
                    value: HttpRequest
                })
            )
        ) || msg;
    }
}
export class HttpResponseParser extends HttpParser {
    constructor() {
        super(HttpParserBinding.RESPONSE);
    }
    protected buildResponse(msg: any): any {
        return HttpResponse.call(
            Object.setPrototypeOf (
                HttpResponse.prototype,
                Object.defineProperty(msg,'constructor',{
                    value: HttpResponse
                })
            )
        ) || msg;
    }
}