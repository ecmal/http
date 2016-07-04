system.register("http/ws/driver/exts_parser", [], function(system,module,jsx) {
    var TOKEN, NOTOKEN, QUOTED, PARAM, EXT, EXT_LIST, NUMBER;
    var Offers = (function (__super) {
        Offers.prototype.push = function (name, params) {
            this._byName[name] = this._byName[name] || [];
            this._byName[name].push(params);
            this._inOrder.push({ name: name, params: params });
        };
        Offers.prototype.eachOffer = function (callback, context) {
            var list = this._inOrder;
            for (var i = 0, n = list.length; i < n; i++)
                callback.call(context, list[i].name, list[i].params);
        };
        Offers.prototype.byName = function (name) {
            return this._byName[name] || [];
        };
        Offers.prototype.toArray = function () {
            return this._inOrder.slice();
        };
        return Offers;
        function Offers() {
            this._byName = {};
            this._inOrder = [];
        }
    })();
    module.define('class', Offers);
    module.export("Offers", Offers);
    var Parser = (function (__super) {
        Parser.parseHeader = function (header) {
            var offers = new Offers();
            if (header === '' || header === undefined)
                return offers;
            if (!EXT_LIST.test(header))
                throw new SyntaxError('Invalid Sec-WebSocket-Extensions header: ' + header);
            var values = header.match(EXT);
            values.forEach(function (value) {
                var params = value.match(new RegExp(PARAM.source, 'g')), name = params.shift(), offer = {};
                params.forEach(function (param) {
                    var args = param.match(PARAM), key = args[1], data;
                    if (args[2] !== undefined) {
                        data = args[2];
                    }
                    else if (args[3] !== undefined) {
                        data = args[3].replace(/\\/g, '');
                    }
                    else {
                        data = true;
                    }
                    if (NUMBER.test(data))
                        data = parseFloat(data);
                    if (offer.hasOwnProperty(key)) {
                        offer[key] = [].concat(offer[key]);
                        offer[key].push(data);
                    }
                    else {
                        offer[key] = data;
                    }
                }, this);
                offers.push(name, offer);
            }, this);
            return offers;
        };
        Parser.serializeParams = function (name, params) {
            var values = [];
            var print = function (key, value) {
                if (Array.isArray(value)) {
                    value.forEach(function (v) {
                        print(key, v);
                    });
                }
                else if (value === true) {
                    values.push(key);
                }
                else if (typeof value === 'number') {
                    values.push(key + '=' + value);
                }
                else if (NOTOKEN.test(value)) {
                    values.push(key + '="' + value.replace(/"/g, '\\"') + '"');
                }
                else {
                    values.push(key + '=' + value);
                }
            };
            for (var key in params) {
                print(key, params[key]);
            }
            return [name].concat(values).join('; ');
        };
        return Parser;
        function Parser() {
        }
    })();
    module.define('class', Parser);
    module.export("Parser", Parser);
    return {
        setters:[],
        execute: function() {
            TOKEN = /([!#\$%&'\*\+\-\.\^_`\|~0-9a-z]+)/;
            NOTOKEN = /([^!#\$%&'\*\+\-\.\^_`\|~0-9a-z])/g;
            QUOTED = /"((?:\\[\x00-\x7f]|[^\x00-\x08\x0a-\x1f\x7f"])*)"/;
            PARAM = new RegExp(TOKEN.source + '(?:=(?:' + TOKEN.source + '|' + QUOTED.source + '))?');
            EXT = new RegExp(TOKEN.source + '(?: *; *' + PARAM.source + ')*', 'g');
            EXT_LIST = new RegExp('^' + EXT.source + '(?: *, *' + EXT.source + ')*$');
            NUMBER = /^-?(0|[1-9][0-9]*)(\.[0-9]+)?$/;
            Offers = module.init(Offers);
            Parser = module.init(Parser);
        }
    }
});
//# sourceMappingURL=exts_parser.js.map