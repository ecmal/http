const TOKEN = /([!#\$%&'\*\+\-\.\^_`\|~0-9a-z]+)/;
const NOTOKEN = /([^!#\$%&'\*\+\-\.\^_`\|~0-9a-z])/g;
const QUOTED = /"((?:\\[\x00-\x7f]|[^\x00-\x08\x0a-\x1f\x7f"])*)"/;
const PARAM = new RegExp(TOKEN.source + '(?:=(?:' + TOKEN.source + '|' + QUOTED.source + '))?');
const EXT = new RegExp(TOKEN.source + '(?: *; *' + PARAM.source + ')*', 'g');
const EXT_LIST = new RegExp('^' + EXT.source + '(?: *, *' + EXT.source + ')*$');
const NUMBER = /^-?(0|[1-9][0-9]*)(\.[0-9]+)?$/;

export class Offers {
    private _byName;
    private _inOrder;

    public constructor() {
        this._byName = {};
        this._inOrder = [];
    }

    public push(name, params) {
        this._byName[name] = this._byName[name] || [];
        this._byName[name].push(params);
        this._inOrder.push({name: name, params: params});
    }

    public eachOffer(callback, context) {
        var list = this._inOrder;
        for (var i = 0, n = list.length; i < n; i++)
            callback.call(context, list[i].name, list[i].params);
    }

    public byName(name) {
        return this._byName[name] || [];
    }

    public toArray() {
        return this._inOrder.slice();
    }
}
export class Parser {
    static parseHeader(header) {
        var offers = new Offers();
        if (header === '' || header === undefined) return offers;

        if (!EXT_LIST.test(header))
            throw new SyntaxError('Invalid Sec-WebSocket-Extensions header: ' + header);

        var values = header.match(EXT);

        values.forEach(function (value) {
            var params = value.match(new RegExp(PARAM.source, 'g')),
                name = params.shift(),
                offer = {};

            params.forEach(function (param) {
                var args = param.match(PARAM), key = args[1], data;

                if (args[2] !== undefined) {
                    data = args[2];
                } else if (args[3] !== undefined) {
                    data = args[3].replace(/\\/g, '');
                } else {
                    data = true;
                }
                if (NUMBER.test(data)) data = parseFloat(data);

                if (offer.hasOwnProperty(key)) {
                    offer[key] = [].concat(offer[key]);
                    offer[key].push(data);
                } else {
                    offer[key] = data;
                }
            }, this);
            offers.push(name, offer);
        }, this);

        return offers;
    }

    static serializeParams(name, params) {
        var values = [];
        var print = function (key, value) {
            if (Array.isArray(value)) {
                value.forEach(function (v) {
                    print(key, v)
                });
            } else if (value === true) {
                values.push(key);
            } else if (typeof value === 'number') {
                values.push(key + '=' + value);
            } else if (NOTOKEN.test(value)) {
                values.push(key + '="' + value.replace(/"/g, '\\"') + '"');
            } else {
                values.push(key + '=' + value);
            }
        };

        for (var key in params){
            print(key, params[key]);
        }

        return [name].concat(values).join('; ');
    }
}
