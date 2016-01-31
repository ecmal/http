System.register(['../handler'], function(exports_1) {
    var __extends = (this && this.__extends) || function (d, b) {
        for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
    var handler_1;
    var FaviconHandler;
    return {
        setters:[
            function (handler_1_1) {
                handler_1 = handler_1_1;
            }],
        execute: function() {
            FaviconHandler = (function (_super) {
                __extends(FaviconHandler, _super);
                function FaviconHandler() {
                    _super.apply(this, arguments);
                }
                FaviconHandler.prototype.handle = function (req, res) {
                    if (req.url == '/favicon.ico') {
                        res.writeHead(200, {
                            'Content-Type': 'image/x-icon'
                        });
                        res.end(new Buffer([
                            'AAABAAEAEBAQAAEABAAoAQAAFgAAACgAAAAQAAAAIAAAAAEABAAAA',
                            'AAAgAAAAAAAAAAAAAAAEAAAAAAAAAAkU1cAKDc4ABjL2wAM3/IAAA',
                            'AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
                            'AAAAAAAAAERERERERERESIiIzMzMzIRIiIjMBMBExEiIiMxMxMzES',
                            'IiIzEzEzMRIiIjERMBExEiIiMxMzMzESIiIzEzMzMRIiIjMTMzMxE',
                            'iIiMzMzMzESIiIiIiIiIRIiIiIiIiIhEiIiIiIiIiESIiIiIiIiIR',
                            'IiIiIiIiIhEREREREREREAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
                            'AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA'
                        ].join(), 'base64'), 'binary');
                    }
                };
                return FaviconHandler;
            })(handler_1.default);
            exports_1("default", FaviconHandler);
        }
    }
});
//# sourceMappingURL=favicon.js.map