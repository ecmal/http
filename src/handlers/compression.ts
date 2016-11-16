import Node from '../node';

import * as stream from "node/stream";
import {Server} from '../server';
import {Handler} from './handler';
import {Bound} from "runtime/decorators";

@Server.handler('compression')
export class CompressionHandler extends Handler {

    static isCompressible(req):boolean {
        let accepts = req.headers['accept-encoding'] || '';
        return accepts.indexOf('gzip') != -1 && this.config;
    }

    private config:any;


    constructor() {
        super();
        this.config = CompressionHandler.config;
    }

    public handle(req, res) {
        if (CompressionHandler.isCompressible(req)) {
             new Compress(req,res);
        }
    }


}

export class Compress{
    private _end:Function;
    private _on:Function;
    private _write:Function;
    private listeners:any = [];
    private ended:boolean = false;
    private stream:any = null;
    private req:any;
    private res:any;
    constructor(req,res){
        this.res = res;
        this.req = req;
        this.wrapResponseMethods();
        this.initHeaders();
        this.createCompressionStream()
    }

    private wrapResponseMethods() {
        this._write = this.res.write;
        this._end = this.res.end;
        this._on = this.res.on;
        this.res.flush = this.flush;
        this.res.write = this.write;
        this.res.end = this.end;
        this.res.on = this.on;
    }

    private createCompressionStream() {
        this.stream = Node.Zlib.createGzip();
        this.passListenersToStream();
        this.stream.on('data', this.onStreamData);
        this.stream.on('end', this.onStreamEnd);
        this.stream.on('drain', this.onStreamDrain);
    }

    private initHeaders() {
        this.res.setHeader('Content-Encoding', 'gzip');
        this.res.removeHeader('Content-Length');
    }

    private passListenersToStream() {
        for (var i = 0; i < this.listeners.length; i++) {
            this.stream.on.apply(this.stream, this.listeners[i])
        }
    }

    @Bound
    private write(chunk, encoding) {
        if (this.ended) {
            return false
        }
        return this.stream
            ? this.stream.write(new Buffer(chunk, encoding))
            : this._write.call(this.res, chunk, encoding)
    };

    @Bound
    private end(chunk, encoding) {
        if (this.ended) {
            return false
        }
        if (!this.stream) {
            return this._end.call(this.res, chunk, encoding)
        }
        this.ended = true;
        return chunk
            ? this.stream.end(new Buffer(chunk, encoding))
            : this.stream.end()
    };

    @Bound
    private on(type:string, listener:Function) {
        if (!this.listeners || type !== 'drain') {
            return this._on.call(this.res, type, listener)
        }
        if (this.stream) {
            return this.stream.on(type, listener)
        }
        this.listeners.push([type, listener]);
        return this
    };

    @Bound
    private flush() {
        if (this.stream) {
            this.stream.flush();
        }
    }

    @Bound
    private onStreamData(chunk) {
        if (this._write.call(this.res, chunk) === false) {
            this.stream.pause();
        }
    }
    @Bound
    private onStreamEnd(chunk) {
        this._end.call(this.res);
    }
    @Bound
    private onStreamDrain(chunk) {
        this.stream.resume();
    }

}
