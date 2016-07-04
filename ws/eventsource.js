system.register("http/ws/eventsource", ["node/stream", "./driver", "./driver/headers", "./api", "./events"], function(system,module,jsx) {
    var stream_1, driver_1, headers_1, api_1, events_1, events_2;
    var EventSource = (function (__super) {
        EventSource.isEventSource = function (request) {
            if (request.method !== 'GET') {
                return false;
            }
            var accept = (request.headers.accept || '').split(/\s*,\s*/);
            return accept.indexOf('text/event-stream') >= 0;
        };
        EventSource.prototype.addEventListener = function (eventType, listener, useCapture) {
            this['on'](eventType, listener);
        };
        EventSource.prototype.removeEventListener = function (eventType, listener, useCapture) {
            this['off'](eventType, listener);
        };
        EventSource.prototype.dispatchEvent = function (event) {
            event.target = event.currentTarget = this;
            event.eventPhase = events_2.Event.AT_TARGET;
            if (this['on' + event.type])
                this['on' + event.type](event);
            this['emit'](event.type, event);
        };
        EventSource.prototype.write = function (message) {
            return this.send(message);
        };
        EventSource.prototype.end = function (message) {
            if (message !== undefined)
                this.write(message);
            this.close();
        };
        EventSource.prototype.send = function (message, options) {
            if (this.readyState > api_1.API.OPEN)
                return false;
            message = String(message).replace(/(\r\n|\r|\n)/g, '$1data: ');
            options = options || {};
            var frame = '';
            if (options.event)
                frame += 'event: ' + options.event + '\r\n';
            if (options.id)
                frame += 'id: ' + options.id + '\r\n';
            frame += 'data: ' + message + '\r\n\r\n';
            return this._write(frame);
        };
        EventSource.prototype.ping = function () {
            return this._write(':\r\n\r\n');
        };
        EventSource.prototype.close = function () {
            if (this.readyState > api_1.API.OPEN)
                return false;
            this.readyState = api_1.API.CLOSED;
            this.writable = false;
            if (this._pingTimer)
                clearInterval(this._pingTimer);
            if (this._stream)
                this._stream.end();
            var event = new events_2.Event('close');
            event.initEvent('close', false, false);
            this.dispatchEvent(event);
            return true;
        };
        EventSource.prototype._write = function (chunk) {
            if (!this.writable)
                return false;
            try {
                return this._stream.write(chunk, 'utf8');
            }
            catch (e) {
                return false;
            }
        };
        EventSource.prototype._open = function () {
            if (this.readyState !== api_1.API.CONNECTING)
                return;
            this.readyState = api_1.API.OPEN;
            var event = new events_2.Event('open');
            event.initEvent('open', false, false);
            this.dispatchEvent(event);
        };
        EventSource.__initializer = function(__parent){
            __super=__parent;
        };
        return EventSource;
        function EventSource(request, response, options) {
            var _this = this;
            __super.call(this);
            this.DEFAULT_PING = 10;
            this.DEFAULT_RETRY = 5;
            this.onopen = null;
            this.onmessage = null;
            this.onerror = null;
            this.onclose = null;
            this.writable = true;
            options = options || {};
            this._stream = response.socket;
            this._ping = options.ping || this.DEFAULT_PING;
            this._retry = options.retry || this.DEFAULT_RETRY;
            var scheme = driver_1.Driver.isSecureRequest(request) ? 'https:' : 'http:';
            this.url = scheme + '//' + request.headers.host + request.url;
            this.lastEventId = request.headers['last-event-id'] || '';
            this.readyState = api_1.API.CONNECTING;
            var headers = new headers_1.Headers();
            if (options.headers) {
                for (var key in options.headers) {
                    headers.set(key, options.headers[key]);
                }
            }
            if (!this._stream || !this._stream.writable) {
                return;
            }
            system.node.process.nextTick(function () {
                _this._open();
            });
            this._stream.setTimeout(0);
            this._stream.setNoDelay(true);
            var handshake = 'HTTP/1.1 200 OK\r\n' +
                'Content-Type: text/event-stream\r\n' +
                'Cache-Control: no-cache, no-store\r\n' +
                'Connection: close\r\n' +
                headers.toString() +
                '\r\n' +
                'retry: ' + Math.floor(this._retry * 1000) + '\r\n\r\n';
            this._write(handshake);
            this._stream.on('drain', function () { _this.emit('drain'); });
            if (this._ping) {
                this._pingTimer = setInterval(function () {
                    _this.ping();
                }, this._ping * 1000);
            }
            ['error', 'end'].forEach(function (event) {
                _this._stream.on(event, function () {
                    _this.close();
                });
            });
        }
    })();
    module.define('class', EventSource);
    module.export("EventSource", EventSource);
    return {
        setters:[
            function (stream_1_1) {
                stream_1 = stream_1_1;
            },
            function (driver_1_1) {
                driver_1 = driver_1_1;
            },
            function (headers_1_1) {
                headers_1 = headers_1_1;
            },
            function (api_1_1) {
                api_1 = api_1_1;
            },
            function (events_1_1) {
                events_1 = events_1_1;
                events_2 = events_1_1;
            }],
        execute: function() {
            EventSource = module.init(EventSource,stream_1.Stream);
            module.exports = EventSource;
        }
    }
});
//# sourceMappingURL=eventsource.js.map