system.register("http/ws/driver/streams", ["node/stream", "./base"], function(system,module,jsx) {
    var stream_1, base_1;
    var IO = (function (__super) {
        IO.prototype.pause = function () {
            this._paused = true;
            this._driver.messages._paused = true;
        };
        IO.prototype.resume = function () {
            this._paused = false;
            this.emit('drain');
            var messages = this._driver.messages;
            messages._paused = false;
            messages.emit('drain');
        };
        IO.prototype.write = function (chunk, enc, callback) {
            if (!this.writable) {
                return false;
            }
            this._driver.parse(chunk);
            return !this._paused;
        };
        IO.prototype.end = function (chunk) {
            if (!this.writable)
                return;
            if (chunk !== undefined)
                this.write(chunk);
            this.writable = false;
            var messages = this._driver.messages;
            if (messages.readable) {
                messages.readable = messages.writable = false;
                messages.emit('end');
            }
        };
        IO.prototype.destroy = function () {
            this.end();
        };
        IO.__initializer = function(__parent){
            __super=__parent;
        };
        return IO;
        function IO(driver) {
            var _this = this;
            __super.call(this);
            this.readable = this.writable = true;
            this._paused = false;
            this._driver = driver;
            this.on('pipe', function (stream) {
                _this.parent = stream;
            });
        }
    })();
    module.define('class', IO);
    module.export("IO", IO);
    var Messages = (function (__super) {
        Messages.prototype.pause = function () {
            //console.info("Messages.PAUSE");
            this._driver.io._paused = true;
        };
        Messages.prototype.resume = function () {
            //console.info("Messages.RESUME");
            this._driver.io._paused = false;
            this._driver.io.emit('drain');
        };
        Messages.prototype.write = function (message) {
            //console.info("Messages.write",message);
            if (!this.writable) {
                return false;
            }
            if (typeof message === 'string') {
                this._driver.text(message);
            }
            else {
                this._driver.binary(message);
            }
            return !this._paused;
        };
        Messages.prototype.end = function (message) {
            if (message !== undefined) {
                this.write(message);
            }
        };
        Messages.prototype.destroy = function () { };
        Messages.__initializer = function(__parent){
            __super=__parent;
        };
        return Messages;
        function Messages(driver) {
            __super.call(this);
            this.readable = this.writable = true;
            this._paused = false;
            this._driver = driver;
        }
    })();
    module.define('class', Messages);
    module.export("Messages", Messages);
    return {
        setters:[
            function (stream_1_1) {
                stream_1 = stream_1_1;
            },
            function (base_1_1) {
                base_1 = base_1_1;
            }],
        execute: function() {
            IO = module.init(IO,stream_1.Stream);
            Messages = module.init(Messages,stream_1.Stream);
        }
    }
});
//# sourceMappingURL=streams.js.map