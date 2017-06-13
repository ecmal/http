import { Url, HttpHeaders } from "./common";
import { HttpServerRequest, HttpServerResponse } from "./server";
import { Buffer } from "@ecmal/node/buffer";
import { Readable } from "@ecmal/node/stream";

export class Resource {
    readonly url: Url;
    readonly body: any;
    readonly request: HttpServerRequest;
    readonly response: HttpServerResponse;

    redirect(location: string, status: number = 302, headers = {}) {
        this.response.writeHead(
            status,
            Object.assign(headers, { location })
        );
        this.response.end();
        return true;
    }

    async read(): Promise<Buffer> {
        return new Promise<Buffer>((accept, reject) => {
            try {
                let data = new Buffer(0);
                this.request.on('data', chunk => {
                    try {
                        data = Buffer.concat([data, chunk], data.length + chunk.length);
                    } catch (ex) {
                        reject(ex);
                    }
                });
                this.request.on('end', () => accept(data));
                this.request.on('error', e => reject(e));
            } catch (ex) {
                reject(ex);
            }
        })
    }
    async write(body: Buffer, code?: number, headers?: HttpHeaders);
    async write(body: Readable, code?: number, headers?: HttpHeaders);
    async write(body: string, code?: number, headers?: HttpHeaders);
    async write(body: any, code?: number, headers?: HttpHeaders);
    async write(body: Buffer | Readable | string | any, code: number = 200, headers: HttpHeaders = {}) {
        let data: Buffer = <Buffer>body;
        let type = 'application/octet-stream';

        if (!(body instanceof Readable) && !Buffer.isBuffer(data)) {
            type = 'text/plain';
            data = new Buffer(String(body), 'utf8');
        }
        headers = Object.keys(headers).reduce((h, k) => (
            h[String(k).toLowerCase()] = headers[k], h
        ), { "content-type": type });

        if (!(data instanceof Readable)) {
            headers["content-length"] = data.length;
        }

        this.response.writeHead(code, headers);
        if (body instanceof Readable) {
            return new Promise((accept, reject) => {
                let writeStream = body.pipe(this.response);
                writeStream.once('finish', () => accept(true));
                writeStream.once('error', (e) => accept(false));
            });
        }
        this.response.end(data);
        return true;
    }
}