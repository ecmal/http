import { Buffer } from "@ecmal/node/buffer";

export class HttpRequest {
    readonly options: any;
    constructor(options) {
        this.options = options;
    }
    getMethod() {
        return this.options.method
    }
    getPath() {
        return this.options.path
    }
    getHeaders() {
        return this.options.headers
    }
    getBody() {
        return Buffer.from(JSON.stringify(this.options.body))
    }
    getHead() {
        let method = this.getMethod();
        let path = this.getPath();
        let headers = this.getHeaders();
        let heads = [`${method} ${path} HTTP/1.1`]
        Object.keys(headers).forEach(header => {
            heads.push(`${header.replace(/\u02C6/g, '-')}: ${headers[header]}`);
        })
        return Buffer.from(heads.join('\r\n') + '\r\n\r\n');
    }
    async sendHead(head: any) {
        return null;
    }
    async sendBody(body: any) {
        return null;
    }
}