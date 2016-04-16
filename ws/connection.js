System.register(["node/events", 'node/crypto'], function(exports_1) {
    var __extends = (this && this.__extends) || function (d, b) {
        for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
    var events_1, CRYPTO;
    var WsOpCode, WsState, WsFrame, WsError, WsConnection;
    return {
        setters:[
            function (events_1_1) {
                events_1 = events_1_1;
            },
            function (CRYPTO_1) {
                CRYPTO = CRYPTO_1;
            }],
        execute: function() {
            (function (WsOpCode) {
                WsOpCode[WsOpCode["CHUNK"] = 0] = "CHUNK";
                WsOpCode[WsOpCode["TEXT"] = 1] = "TEXT";
                WsOpCode[WsOpCode["BINARY"] = 2] = "BINARY";
                WsOpCode[WsOpCode["CLOSE"] = 8] = "CLOSE";
                WsOpCode[WsOpCode["PING"] = 9] = "PING";
                WsOpCode[WsOpCode["PONG"] = 10] = "PONG";
            })(WsOpCode || (WsOpCode = {}));
            exports_1("WsOpCode", WsOpCode);
            (function (WsState) {
                WsState[WsState["CONNECTING"] = 0] = "CONNECTING";
                WsState[WsState["OPEN"] = 1] = "OPEN";
            })(WsState || (WsState = {}));
            exports_1("WsState", WsState);
            WsFrame = (function () {
                function WsFrame(fin, opcode, payload, size) {
                    this.fin = fin;
                    this.op = opcode;
                    this.size = size;
                    this.data = payload;
                }
                WsFrame.decode = function (data, isServer) {
                    var fin, opcode, B, HB, mask, len, payload, start, i, hasMask;
                    if (data.length < 2) {
                        return;
                    }
                    // Is this the last frame in a sequence?
                    B = data[0];
                    HB = B >> 4;
                    if (HB % 8) {
                        // RSV1, RSV2 and RSV3 must be clear
                        return null;
                    }
                    fin = HB === 8;
                    opcode = B % 16;
                    if (opcode !== 0 && opcode !== 1 && opcode !== 2 &&
                        opcode !== 8 && opcode !== 9 && opcode !== 10) {
                        // Invalid opcode
                        return null;
                    }
                    if (opcode >= 8 && !fin) {
                        // Control frames must not be fragmented
                        return null;
                    }
                    B = data[1];
                    hasMask = B >> 7;
                    if ((isServer && !hasMask) || (!isServer && hasMask)) {
                        // Frames sent by clients must be masked
                        return null;
                    }
                    len = B % 128;
                    start = hasMask ? 6 : 2;
                    if (data.length < start + len) {
                        // Not enough data in the buffer
                        return null;
                    }
                    // Get the actual payload length
                    if (len === 126) {
                        len = data.readUInt16BE(2);
                        start += 2;
                    }
                    else if (len === 127) {
                        // Warning: JS can only store up to 2^53 in its number format
                        len = data.readUInt32BE(2) * Math.pow(2, 32) + data.readUInt32BE(6);
                        start += 8;
                    }
                    if (data.length < start + len) {
                        return null;
                    }
                    // Extract the payload
                    payload = data.slice(start, start + len);
                    if (hasMask) {
                        // Decode with the given mask
                        mask = data.slice(start - 4, start);
                        for (i = 0; i < payload.length; i++) {
                            payload[i] ^= mask[i % 4];
                        }
                    }
                    return new WsFrame(fin, opcode, payload, start + len);
                };
                WsFrame.createFrames = function (op, data, handler) {
                    var start = 0, end = start + WsFrame.MAX_SIZE, first = true;
                    while (start < data.length) {
                        var first = start == 0;
                        var end = Math.min(start + WsFrame.MAX_SIZE, data.length);
                        var buffer = data.slice(start, start = end);
                        handler(this.createFrame(first ? op : WsOpCode.CHUNK, buffer, end >= data.length));
                    }
                };
                WsFrame.createFrame = function (op, data, fin, masked) {
                    if (fin === void 0) { fin = true; }
                    if (masked === void 0) { masked = false; }
                    var payload, meta;
                    if (masked) {
                        payload = new Buffer(data.length);
                        data.copy(payload);
                    }
                    else {
                        payload = data;
                    }
                    meta = this.createMetaData(fin, op, masked, payload);
                    return Buffer.concat([meta, payload], meta.length + payload.length);
                };
                WsFrame.createMetaData = function (fin, opcode, masked, payload) {
                    var len, meta, start, mask, i;
                    len = payload.length;
                    // Creates the buffer for meta-data
                    meta = new Buffer(2 + (len < 126 ? 0 : (len < 65536 ? 2 : 8)) + (masked ? 4 : 0));
                    // Sets fin and opcode
                    meta[0] = (fin ? 128 : 0) + opcode;
                    // Sets the mask and length
                    meta[1] = masked ? 128 : 0;
                    start = 2;
                    if (len < 126) {
                        meta[1] += len;
                    }
                    else if (len < 65536) {
                        meta[1] += 126;
                        meta.writeUInt16BE(len, 2);
                        start += 2;
                    }
                    else {
                        // Warning: JS doesn't support integers greater than 2^53
                        meta[1] += 127;
                        meta.writeUInt32BE(Math.floor(len / Math.pow(2, 32)), 2);
                        meta.writeUInt32BE(len % Math.pow(2, 32), 6);
                        start += 8;
                    }
                    // Set the mask-key
                    if (masked) {
                        mask = new Buffer(4);
                        for (i = 0; i < 4; i++) {
                            meta[start + i] = mask[i] = Math.floor(Math.random() * 256);
                        }
                        for (i = 0; i < payload.length; i++) {
                            payload[i] ^= mask[i % 4];
                        }
                        start += 4;
                    }
                    return meta;
                };
                WsFrame.prototype.inspect = function () {
                    var length = this.data ? this.data.length : 0;
                    return {
                        fin: this.fin,
                        op: this.op,
                        size: this.size,
                        length: this.size - length
                    };
                };
                WsFrame.MAX_SIZE = 128 * 1024;
                return WsFrame;
            })();
            exports_1("WsFrame", WsFrame);
            WsError = (function (_super) {
                __extends(WsError, _super);
                function WsError(code, message) {
                    _super.call(this, message);
                    this.code = code;
                }
                WsError.prototype.toString = function () {
                    return this.code + " " + this.message;
                };
                return WsError;
            })(Error);
            exports_1("WsError", WsError);
            WsConnection = (function (_super) {
                __extends(WsConnection, _super);
                function WsConnection(isServer) {
                    var _this = this;
                    _super.call(this);
                    var socket, headers, state = WsState.CONNECTING, buffer = new Buffer(0);
                    this.queue = [];
                    Object.defineProperty(this, 'state', {
                        enumerable: false,
                        get: function () { return state; },
                        set: function (v) { return state = v; }
                    });
                    Object.defineProperty(this, 'socket', {
                        enumerable: false,
                        configurable: true,
                        set: function (v) {
                            v.on('close', function (ok) {
                                _this.onClose(new Buffer(ok ? "0001" : "0000"));
                            });
                            v.on('connect', function (ok) {
                                console.info('connect', ok);
                            });
                            v.on('data', function (data) {
                                if (data.length) {
                                    buffer = Buffer.concat([buffer, data]);
                                    var frame = WsFrame.decode(buffer, isServer);
                                    if (frame) {
                                        buffer = buffer.slice(frame.size);
                                        _this.onFrame(frame);
                                    }
                                }
                            });
                            v.on('drain', function (ok) {
                                //console.info('drain');
                            });
                            v.on('end', function (data) {
                                //console.info("END SOCKET END");
                                if (data && data.length) {
                                    buffer = Buffer.concat([buffer, data]);
                                    var frame = WsFrame.decode(buffer, isServer);
                                    if (frame) {
                                        buffer = buffer.slice(frame.size);
                                        _this.onFrame(frame);
                                    }
                                }
                            });
                            v.on('error', function (e) {
                                console.info('onError', e.stack);
                                v.destroy();
                            });
                            Object.defineProperty(_this, 'socket', {
                                enumerable: false,
                                configurable: false,
                                value: v
                            });
                            _this.pinger = setInterval(function () {
                                _this.sendPing();
                            }, 5000);
                        }
                    });
                    Object.defineProperty(this, 'headers', {
                        enumerable: false,
                        configurable: true,
                        set: function (v) {
                            Object.defineProperty(_this, 'headers', {
                                enumerable: false,
                                configurable: false,
                                value: v
                            });
                        }
                    });
                    Object.defineProperty(this, 'server', {
                        enumerable: false,
                        configurable: true,
                        set: function (v) {
                            Object.defineProperty(_this, 'server', {
                                enumerable: false,
                                configurable: false,
                                value: v
                            });
                        }
                    });
                }
                Object.defineProperty(WsConnection.prototype, "version", {
                    get: function () {
                        return this.headers['sec-websocket-version'].toLowerCase();
                    },
                    enumerable: true,
                    configurable: true
                });
                Object.defineProperty(WsConnection.prototype, "origin", {
                    get: function () {
                        return this.headers['origin'].toLowerCase();
                    },
                    enumerable: true,
                    configurable: true
                });
                Object.defineProperty(WsConnection.prototype, "key", {
                    get: function () {
                        return this.headers['sec-websocket-key'];
                    },
                    enumerable: true,
                    configurable: true
                });
                Object.defineProperty(WsConnection.prototype, "id", {
                    get: function () {
                        return Object.defineProperty(this, 'id', {
                            enumerable: true,
                            writable: false,
                            configurable: false,
                            value: CRYPTO
                                .createHash('md5')
                                .update(this.hash, 'ascii')
                                .digest('hex')
                        }).id;
                    },
                    enumerable: true,
                    configurable: true
                });
                Object.defineProperty(WsConnection.prototype, "hash", {
                    get: function () {
                        return Object.defineProperty(this, 'hash', {
                            enumerable: true,
                            writable: false,
                            configurable: false,
                            value: CRYPTO
                                .createHash('sha1')
                                .update(this.key + "258EAFA5-E914-47DA-95CA-C5AB0DC85B11", 'ascii')
                                .digest('base64')
                        }).hash;
                    },
                    enumerable: true,
                    configurable: true
                });
                Object.defineProperty(WsConnection.prototype, "protocols", {
                    get: function () {
                        return String(this.headers['sec-websocket-protocol'])
                            .trim()
                            .toLowerCase()
                            .split(',')
                            .map(function (p) { return p && p.trim(); });
                    },
                    enumerable: true,
                    configurable: true
                });
                WsConnection.prototype.connect = function () {
                    this.server = false;
                    return true;
                };
                WsConnection.prototype.accept = function (request, protocol) {
                    this.server = true;
                    this.headers = request.headers;
                    if (this.version != '13') {
                        throw new WsError(400, "Unsupported Socket Version " + this.version);
                    }
                    else if (this.protocols.indexOf(protocol) < 0) {
                        return false;
                    }
                    else {
                        this.socket = request.socket;
                        return true;
                    }
                };
                WsConnection.prototype.onFrame = function (frame) {
                    this.emit('frame', frame);
                    if (frame.fin) {
                        switch (frame.op) {
                            case WsOpCode.BINARY: return this.onBinary(frame.data);
                            case WsOpCode.TEXT: return this.onText(frame.data);
                            case WsOpCode.PONG: return this.onPong(frame.data);
                            case WsOpCode.PING: return this.onPing(frame.data);
                            case WsOpCode.CLOSE: return this.onClose(frame.data);
                            case WsOpCode.CHUNK: return this.onStreamDone(frame.data);
                            default: throw new Error('Invalid Frame');
                        }
                    }
                    else {
                        switch (frame.op) {
                            case WsOpCode.BINARY: return this.onStreamBinary(frame.data);
                            case WsOpCode.TEXT: return this.onStreamText(frame.data);
                            case WsOpCode.CHUNK: return this.onStreamChunk(frame.data);
                            default: throw new Error('Invalid Frame');
                        }
                    }
                };
                WsConnection.prototype.onText = function (buffer) {
                    this.emit('text', buffer.toString());
                };
                WsConnection.prototype.onBinary = function (buffer) {
                    this.emit('binary', buffer);
                };
                WsConnection.prototype.onPong = function (buffer) {
                    var time = buffer.toString();
                    //console.info("ON PONG",this.id,time,time==this.ping);
                    this.ping = null;
                    this.emit('pong', time);
                };
                WsConnection.prototype.onPing = function (buffer) {
                    //console.info("ON PING");
                    this.emit('ping', buffer);
                    this.sendFrame(WsOpCode.PONG, buffer);
                };
                WsConnection.prototype.onClose = function (buffer) {
                    var code = 0;
                    var message = "";
                    if (buffer) {
                        code = buffer.readUInt16BE(0);
                        message = buffer.toString('utf8', 2);
                    }
                    clearInterval(this.pinger);
                    this.emit('close', code, message);
                };
                WsConnection.prototype.onStreamBinary = function (buffer) {
                    this.reading = WsOpCode.BINARY;
                    if (this.listeners('stream').length) {
                        this.emit('stream', buffer, this.reading, 'start');
                    }
                    else {
                        this.readingBuffer = buffer;
                    }
                };
                WsConnection.prototype.onStreamText = function (buffer) {
                    this.reading = WsOpCode.TEXT;
                    if (this.listeners('stream').length) {
                        this.emit('stream', buffer, this.reading, 'start');
                    }
                    else {
                        this.readingBuffer = buffer;
                    }
                };
                WsConnection.prototype.onStreamChunk = function (buffer) {
                    if (this.listeners('stream').length) {
                        this.emit('stream', buffer, this.reading, 'chunk');
                    }
                    else {
                        this.readingBuffer = Buffer.concat([this.readingBuffer, buffer], this.readingBuffer.length + buffer.length);
                    }
                };
                WsConnection.prototype.onStreamDone = function (buffer) {
                    if (this.listeners('stream').length) {
                        this.emit('stream', buffer, this.reading, 'chunk');
                    }
                    else {
                        this.readingBuffer = Buffer.concat([this.readingBuffer, buffer], this.readingBuffer.length + buffer.length);
                        switch (this.reading) {
                            case WsOpCode.TEXT:
                                this.onText(this.readingBuffer);
                                break;
                            case WsOpCode.BINARY:
                                this.onBinary(this.readingBuffer);
                                break;
                        }
                        this.reading = null;
                        this.readingBuffer = null;
                    }
                };
                WsConnection.prototype.sendFrame = function (op, data) {
                    var _this = this;
                    this.queue.push({ op: op, data: data });
                    if (this.queue.length == 1) {
                        while (this.queue.length) {
                            var op = this.queue[0].op;
                            var data = this.queue[0].data;
                            WsFrame.createFrames(op, data, function (frame) {
                                _this.socket.write(frame);
                            });
                            this.queue.shift();
                        }
                    }
                };
                WsConnection.prototype.sendPing = function () {
                    if (!this.ping) {
                        this.ping = new Date().toISOString();
                        this.sendFrame(WsOpCode.PING, new Buffer(this.ping));
                    }
                };
                WsConnection.prototype.sendText = function (text) {
                    this.sendFrame(WsOpCode.TEXT, new Buffer(text));
                };
                WsConnection.prototype.sendBinary = function (buffer) {
                    this.sendFrame(WsOpCode.BINARY, buffer);
                };
                return WsConnection;
            })(events_1.EventEmitter);
            exports_1("WsConnection", WsConnection);
        }
    }
});
//# sourceMappingURL=connection.js.map