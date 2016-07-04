const NodeHTTPParser = system.node.process.binding('http_parser').HTTPParser;
const version = NodeHTTPParser.RESPONSE ? 6 : 4;

export class HttpParser {

    static METHODS = {
        0: 'DELETE',
        1: 'GET',
        2: 'HEAD',
        3: 'POST',
        4: 'PUT',
        5: 'CONNECT',
        6: 'OPTIONS',
        7: 'TRACE',
        8: 'COPY',
        9: 'LOCK',
        10: 'MKCOL',
        11: 'MOVE',
        12: 'PROPFIND',
        13: 'PROPPATCH',
        14: 'SEARCH',
        15: 'UNLOCK',
        16: 'REPORT',
        17: 'MKACTIVITY',
        18: 'CHECKOUT',
        19: 'MERGE',
        24: 'PATCH'
    };

    private _parser:any;
    private _type:any;
    private _complete:any;
    public headers:any;
    public method:string;
    public url:string;
    public body:any;
    public statusCode:number;

    public constructor(type) {
        if (type === 'request')
            this._parser = new NodeHTTPParser(NodeHTTPParser.REQUEST || 'request');
        else
            this._parser = new NodeHTTPParser(NodeHTTPParser.RESPONSE || 'response');

        this._type = type;
        this._complete = false;
        this.headers = {};

        var current = null;

        this._parser.onHeaderField = (b, start, length) =>{
            current = b.toString('utf8', start, start + length).toLowerCase();
        };
        this._parser.onHeaderValue = (b, start, length) =>{
            var value = b.toString('utf8', start, start + length);

            if (this.headers.hasOwnProperty(current))
                this.headers[current] += ', ' + value;
            else
                this.headers[current] = value;
        };
        this._parser.onHeadersComplete = this._parser[NodeHTTPParser.kOnHeadersComplete] = (majorVersion, minorVersion, headers, method, pathname, statusCode) => {
            var info = majorVersion;
            if (typeof info === 'object') {
                method = info.method;
                pathname = info.url;
                statusCode = info.statusCode;
                headers = info.headers;
            }

            this.method = (typeof method === 'number') ? HttpParser.METHODS[method] : method;
            this.statusCode = statusCode;
            this.url = pathname;

            if (!headers) return;

            for (var i = 0, n = headers.length, key, value; i < n; i += 2) {
                key = headers[i].toLowerCase();
                value = headers[i + 1];
                if (this.headers.hasOwnProperty(key))
                    this.headers[key] += ', ' + value;
                else
                    this.headers[key] = value;
            }

            this._complete = true;
        };
    }
    public isComplete() {
        return this._complete;
    }
    public parse(chunk) {
        var offset = (version < 6) ? 1 : 0,
            consumed = this._parser.execute(chunk, 0, chunk.length) + offset;
        if (this._complete) {
            this.body = (consumed < chunk.length)
                ? chunk.slice(consumed)
                : new Buffer(0);
        }
    }
}

