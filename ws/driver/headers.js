system.register("http/ws/driver/headers", [], function(system,module,jsx) {
    var Headers = (function (__super) {
        Headers.prototype.clear = function () {
            this._sent = {};
            this._lines = [];
        };
        Headers.prototype.set = function (name, value) {
            if (value === undefined)
                return;
            name = this._strip(name);
            value = this._strip(value);
            var key = name.toLowerCase();
            if (!this._sent.hasOwnProperty(key) || this.ALLOWED_DUPLICATES.indexOf(key) >= 0) {
                this._sent[key] = true;
                this._lines.push(name + ': ' + value + '\r\n');
            }
        };
        Headers.prototype.toString = function () {
            return this._lines.join('');
        };
        Headers.prototype._strip = function (string) {
            return string.toString().replace(/^ */, '').replace(/ *$/, '');
        };
        return Headers;
        function Headers() {
            this.ALLOWED_DUPLICATES = ['set-cookie', 'set-cookie2', 'warning', 'www-authenticate'];
            this.clear();
        }
    })();
    module.define('class', Headers);
    module.export("Headers", Headers);
    return {
        setters:[],
        execute: function() {
            Headers = module.init(Headers);
        }
    }
});
//# sourceMappingURL=headers.js.map