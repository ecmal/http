system.register("http/ws/driver/base", ['node/events', './streams', './headers', './stream_reader'], function(system,module,jsx) {
    var events_1, streams_1, headers_1, stream_reader_1;
    var ConnectEvent = (function (__super) {
        return ConnectEvent;
        function ConnectEvent() {
        }
    })();
    module.define('class', ConnectEvent);
    module.export("ConnectEvent", ConnectEvent);
    var OpenEvent = (function (__super) {
        return OpenEvent;
        function OpenEvent() {
        }
    })();
    module.define('class', OpenEvent);
    module.export("OpenEvent", OpenEvent);
    var CloseEvent = (function (__super) {
        return CloseEvent;
        function CloseEvent(code, reason) {
            this.code = code;
            this.reason = reason;
        }
    })();
    module.define('class', CloseEvent);
    module.export("CloseEvent", CloseEvent);
    var MessageEvent = (function (__super) {
        return MessageEvent;
        function MessageEvent(data) {
            this.data = data;
        }
    })();
    module.define('class', MessageEvent);
    module.export("MessageEvent", MessageEvent);
    var Base = (function (__super) {
        Base.validateOptions = function (options, validKeys) {
            for (var key in options) {
                if (validKeys.indexOf(key) < 0)
                    throw new Error('Unrecognized option: ' + key);
            }
        };
        Base.prototype.parse = function (chunk) {
            throw new Error('abstract function');
        };
        Base.prototype.proxy = function (origin, options) {
            throw new Error('abstract function');
        };
        Base.prototype.getState = function () {
            return this.STATES[this.readyState] || null;
        };
        Base.prototype.addExtension = function (extension) {
            return false;
        };
        Base.prototype.setHeader = function (name, value) {
            if (this.readyState > 0)
                return false;
            this._headers.set(name, value);
            return true;
        };
        Base.prototype.start = function () {
            if (this.readyState !== 0)
                return false;
            var response = this._handshakeResponse();
            if (!response)
                return false;
            this._write(response);
            if (this._stage !== -1) {
                this._open();
            }
            return true;
        };
        Base.prototype.text = function (message) {
            return this.frame(message);
        };
        Base.prototype.binary = function (message) {
            return false;
        };
        Base.prototype.ping = function (message, callback) {
            return false;
        };
        Base.prototype.pong = function (message) {
            return false;
        };
        Base.prototype.close = function (reason, code) {
            if (this.readyState !== 1)
                return false;
            this.readyState = 3;
            this.emit('close', new Base.CloseEvent(null, null));
            return true;
        };
        Base.prototype.frame = function (buffer, type, code) {
            throw new Error('abstract function');
        };
        Base.prototype._handshakeResponse = function () { };
        Base.prototype._bindEventListeners = function () {
            var _this = this;
            // Protocol errors are informational and do not have to be handled
            this.messages.on('error', function (e) { });
            this.on('message', function (event) {
                if (_this.messages.readable) {
                    _this.messages.emit('data', event.data);
                }
            });
            this.on('error', function (error) {
                if (_this.messages.readable) {
                    _this.messages.emit('error', error);
                }
            });
            this.on('close', function () {
                if (this.messages.readable) {
                    this.messages.readable = this.messages.writable = false;
                    this.messages.emit('end');
                }
            });
        };
        Base.prototype._open = function () {
            this.readyState = 1;
            this.__queue.forEach(function (args) {
                this.frame.apply(this, args);
            }, this);
            this.__queue = [];
            this.emit('open', new Base.OpenEvent());
        };
        Base.prototype._queue = function (message) {
            this.__queue.push(message);
            return true;
        };
        Base.prototype._write = function (chunk) {
            var io = this.io;
            if (io.readable) {
                io.emit('data', chunk);
            }
        };
        Base.__initializer = function(__parent){
            __super=__parent;
            Base.ConnectEvent = ConnectEvent;
            Base.OpenEvent = OpenEvent;
            Base.CloseEvent = CloseEvent;
            Base.MessageEvent = MessageEvent;
        };
        return Base;
        function Base(request, url, options) {
            __super.call(this);
            this.MAX_LENGTH = 0x3ffffff;
            this.STATES = ['connecting', 'open', 'closing', 'closed'];
            Base.validateOptions(options || {}, ['maxLength', 'masking', 'requireMasking', 'protocols']);
            this._request = request;
            this._reader = new stream_reader_1.StreamReader();
            this._options = options || {};
            this._maxLength = this._options.maxLength || this.MAX_LENGTH;
            this._headers = new headers_1.Headers();
            this.__queue = [];
            this.readyState = 0;
            this.url = url;
            this.io = new streams_1.IO(this);
            this.messages = new streams_1.Messages(this);
            this._bindEventListeners();
        }
    })();
    module.define('class', Base);
    module.export("Base", Base);
    return {
        setters:[
            function (events_1_1) {
                events_1 = events_1_1;
            },
            function (streams_1_1) {
                streams_1 = streams_1_1;
            },
            function (headers_1_1) {
                headers_1 = headers_1_1;
            },
            function (stream_reader_1_1) {
                stream_reader_1 = stream_reader_1_1;
            }],
        execute: function() {
            ConnectEvent = module.init(ConnectEvent);
            OpenEvent = module.init(OpenEvent);
            CloseEvent = module.init(CloseEvent);
            MessageEvent = module.init(MessageEvent);
            Base = module.init(Base,events_1.EventEmitter);
        }
    }
});
//# sourceMappingURL=base.js.map