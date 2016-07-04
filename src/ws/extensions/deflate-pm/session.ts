import * as zlib from "node/zlib";
import {Common} from "./common";

export class Session {

    protected _level;
    protected _memLevel;
    protected _strategy;
    protected _acceptNoContextTakeover;
    protected _acceptMaxWindowBits;
    protected _requestNoContextTakeover;
    protected _requestMaxWindowBits;
    protected _ownContextTakeover;
    protected _ownWindowBits;
    protected _peerWindowBits;
    protected _peerContextTakeover;
    protected _queueIn;
    protected _queueOut;
    protected _lockIn;
    protected _lockOut;
    protected _inflate;
    protected _deflate;

    constructor(options) {
        this._level = Common.fetch(options, 'level', zlib.Z_DEFAULT_LEVEL);
        this._memLevel = Common.fetch(options, 'memLevel', zlib.Z_DEFAULT_MEMLEVEL);
        this._strategy = Common.fetch(options, 'strategy', zlib.Z_DEFAULT_STRATEGY);
        this._acceptNoContextTakeover = Common.fetch(options, 'noContextTakeover', false);
        this._acceptMaxWindowBits = Common.fetch(options, 'maxWindowBits', undefined);
        this._requestNoContextTakeover = Common.fetch(options, 'requestNoContextTakeover', false);
        this._requestMaxWindowBits = Common.fetch(options, 'requestMaxWindowBits', undefined);
        this._queueIn = [];
        this._queueOut = [];
    }

    public processIncomingMessage(message, callback) {
        if (!message.rsv1){
            return callback(null, message);
        }
        if (this._lockIn){
            return this._queueIn.push([message, callback]);
        }
        let inflate = this._getInflate(),chunks = [],length = 0;
        let self = this;
        if (this._inflate){
            this._lockIn = true;
        }
        let return_ = function (error, message) {
            return_ = function (){};
            inflate.removeListener('data', onData);
            inflate.removeListener('error', onError);
            if (!self._inflate) self._close(inflate);
            self._lockIn = false;
            let next = self._queueIn.shift();
            if (next){
                self.processIncomingMessage.apply(self, next);
            }
            callback(error, message);
        };
        let onData = function (data) {
            chunks.push(data);
            length += data.length;
        };
        let onError = function (error) {
            return_(error, null);
        };
        inflate.on('data', onData);
        inflate.on('error', onError);
        inflate.write(message.data);
        inflate.write(new Buffer([0x00, 0x00, 0xff, 0xff]));
        inflate.flush(function () {
            message.data = Common.concat(chunks, length);
            return_(null, message);
        });
    }
    public processOutgoingMessage(message, callback) {
        if (this._lockOut){
            return this._queueOut.push([message, callback]);
        }
        let deflate = this._getDeflate(),chunks = [],length = 0;
        let self = this;
        if (this._deflate){
            this._lockOut = true;
        }
        let return_ = function (error, message) {
            return_ = function () {};
            deflate.removeListener('data', onData);
            deflate.removeListener('error', onError);
            if (!self._deflate){
                self._close(deflate);
            }
            self._lockOut = false;
            let next = self._queueOut.shift();
            if (next){
                self.processOutgoingMessage.apply(self, next);
            }
            callback(error, message);
        };

        let onData = function (data) {
            chunks.push(data);
            length += data.length;
        };

        let onError = function (error) {
            return_(error, null);
        };

        deflate.on('data', onData);
        deflate.on('error', onError);
        deflate.write(message.data);
        let onFlush = function () {
            let data = Common.concat(chunks, length);
            message.data = data.slice(0, data.length - 4);
            message.rsv1 = true;
            return_(null, message);
        };
        if (deflate.params !== undefined) {
            deflate.flush(zlib.Z_SYNC_FLUSH, onFlush);
        } else {
            deflate.flush(onFlush);
        }
    }
    public close() {
        this._close(this._inflate);
        this._inflate = null;
        this._close(this._deflate);
        this._deflate = null;
    }
    protected _getInflate() {
        if (this._inflate) return this._inflate;
        let inflate = zlib.createInflateRaw({windowBits: this._peerWindowBits});
        if (this._peerContextTakeover) this._inflate = inflate;
        return inflate;
    }
    protected _getDeflate() {
        if (this._deflate) return this._deflate;
        let deflate = zlib.createDeflateRaw({
            windowBits: this._ownWindowBits,
            level: this._level,
            memLevel: this._memLevel,
            strategy: this._strategy
        });

        let flush = deflate.flush;

        // This monkey-patch is needed to make Node 0.10 produce optimal output.
        // Without this it uses Z_FULL_FLUSH and effectively drops all its context
        // state on every flush.

        if (deflate['_flushFlag'] !== undefined && deflate['params'] === undefined)
            deflate.flush = function (callback) {
                let ws = this._writableState;
                if (ws.ended || ws.ending || ws.needDrain) {
                    flush.call(this, callback);
                } else {
                    this._flushFlag = zlib.Z_SYNC_FLUSH;
                    this.write(new Buffer(0), '', callback);
                }
            };

        if (this._ownContextTakeover) this._deflate = deflate;
        return deflate;
    }
    protected _close(codec) {
        if (!codec || !codec.close){
            return;
        }
        try {
            codec.close()
        } catch (error) {}
    }
}


