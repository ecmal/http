system.register("http/ws/api", ["node/stream", "./driver", "./driver/base", "./events"], function(system,module,jsx) {
    var stream_1, driver_1, base_1, events_1, events_2;
    var API = (function (__super) {
        API.prototype.write = function (data) {
            return this.send(data);
        };
        API.prototype.end = function (data) {
            if (data !== undefined)
                this.send(data);
            this.close();
        };
        API.prototype.pause = function () {
            return this._driver.messages.pause();
        };
        API.prototype.resume = function () {
            return this._driver.messages.resume();
        };
        API.prototype.send = function (data) {
            if (this.readyState > API.OPEN)
                return false;
            if (!Buffer.isBuffer(data)) {
                data = String(data);
            }
            return this._driver.messages.write(data);
        };
        API.prototype.ping = function (message, callback) {
            if (this.readyState > API.OPEN)
                return false;
            return this._driver.ping(message, callback);
        };
        API.prototype.close = function (code, reason) {
            if (code === undefined)
                code = 1000;
            if (reason === undefined)
                reason = '';
            if (code !== 1000 && (code < 3000 || code > 4999))
                throw new Error("Failed to execute 'close' on WebSocket: " +
                    "The code must be either 1000, or between 3000 and 4999. " +
                    code + " is neither.");
            if (this.readyState !== API.CLOSED)
                this.readyState = API.CLOSING;
            this._driver.close(reason, code);
        };
        API.prototype.addEventListener = function (eventType, listener, useCapture) {
            this['on'](eventType, listener);
        };
        API.prototype.removeEventListener = function (eventType, listener, useCapture) {
            this['off'](eventType, listener);
        };
        API.prototype.dispatchEvent = function (event) {
            event.target = event.currentTarget = this;
            event.eventPhase = events_1.Event.AT_TARGET;
            if (this['on' + event.type])
                this['on' + event.type](event);
            this['emit'](event.type, event);
        };
        API.prototype._configureApi = function (options) {
            var _this = this;
            driver_1.Driver.validateOptions(options, [
                'headers', 'extensions', 'maxLength', 'ping', 'proxy', 'tls', 'ca'
            ]);
            this.readable = this.writable = true;
            this._ping = options.ping;
            this._pingId = 0;
            this.readyState = API.CONNECTING;
            this.bufferedAmount = 0;
            this.protocol = '';
            this.url = this._driver.url;
            this.version = this._driver.version;
            this._driver.on('open', function (e) {
                _this._open();
            });
            this._driver.on('message', function (e) {
                _this._receiveMessage(e.data);
            });
            this._driver.on('close', function (e) {
                _this._beginClose(e.reason, e.code);
            });
            this._driver.on('error', function (e) {
                _this._emitError(e.message);
            });
            this._driver.messages.on('drain', function () { _this.emit('drain'); });
            var headers = options.headers;
            if (headers) {
                for (var name in headers) {
                    this._driver.setHeader(name, headers[name]);
                }
            }
            var extensions = options.extensions;
            if (extensions) {
                extensions.forEach(function (e) {
                    _this._driver.addExtension(e);
                });
            }
            this.on('error', function () {
            });
            if (this._ping)
                this._pingTimer = setInterval(function () {
                    _this._pingId += 1;
                    _this.ping(_this._pingId.toString());
                }, this._ping * 1000);
            this._configureStream();
            if (!this._proxy) {
                this._stream.pipe(this._driver.io);
                this._driver.io.pipe(this._stream);
            }
        };
        API.prototype._configureStream = function () {
            var self = this;
            this._stream.setTimeout(0);
            this._stream.setNoDelay(true);
            ['close', 'end'].forEach(function (event) {
                this._stream.on(event, function () {
                    self._finalizeClose();
                });
            }, this);
            this._stream.on('error', function (error) {
                self._emitError('Network error: ' + self.url + ': ' + error.message);
                self._finalizeClose();
            });
        };
        API.prototype._open = function () {
            if (this.readyState !== API.CONNECTING)
                return;
            this.readyState = API.OPEN;
            this.protocol = this._driver.protocol || '';
            var event = new events_1.Event('open');
            event.initEvent('open', false, false);
            this.dispatchEvent(event);
        };
        API.prototype._receiveMessage = function (data) {
            if (this.readyState > API.OPEN)
                return false;
            if (this.readable)
                this.emit('data', data);
            var event = new events_1.Event('message', { data: data });
            event.initEvent('message', false, false);
            this.dispatchEvent(event);
        };
        API.prototype._emitError = function (message) {
            if (this.readyState >= API.CLOSING)
                return;
            var event = new events_1.Event('error', { message: message });
            event.initEvent('error', false, false);
            this.dispatchEvent(event);
        };
        API.prototype._beginClose = function (reason, code) {
            if (this.readyState === API.CLOSED)
                return;
            this.readyState = API.CLOSING;
            this._closeParams = [reason, code];
            if (this._stream) {
                this._stream.end();
                if (!this._stream.readable)
                    this._finalizeClose();
            }
        };
        API.prototype._finalizeClose = function () {
            if (this.readyState === API.CLOSED)
                return;
            this.readyState = API.CLOSED;
            if (this._pingTimer)
                clearInterval(this._pingTimer);
            if (this._stream)
                this._stream.end();
            if (this.readable)
                this.emit('end');
            this.readable = this.writable = false;
            var reason = this._closeParams ? this._closeParams[0] : '', code = this._closeParams ? this._closeParams[1] : 1006;
            var event = new events_1.Event('close', { code: code, reason: reason });
            event.initEvent('close', false, false);
            this.dispatchEvent(event);
        };
        API.__initializer = function(__parent){
            __super=__parent;
            API.CONNECTING = 0;
            API.OPEN = 1;
            API.CLOSING = 2;
            API.CLOSED = 3;
        };
        return API;
        function API(options) {
            __super.call(this);
            this.onopen = null;
            this.onmessage = null;
            this.onerror = null;
            this.onclose = null;
            if (options) {
                this._configureApi(options);
            }
        }
    })();
    module.define('class', API);
    module.export("API", API);
    return {
        setters:[
            function (stream_1_1) {
                stream_1 = stream_1_1;
            },
            function (driver_1_1) {
                driver_1 = driver_1_1;
            },
            function (base_1_1) {
                base_1 = base_1_1;
            },
            function (events_1_1) {
                events_1 = events_1_1;
                events_2 = events_1_1;
            }],
        execute: function() {
            API = module.init(API,stream_1.Stream);
        }
    }
});
//# sourceMappingURL=api.js.map