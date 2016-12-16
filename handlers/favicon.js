system.register("http/handlers/favicon", ['../handler'], function(system,module,jsx) {
    var handler_1;
    var FaviconHandler = (function (__super) {
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
        FaviconHandler.__initializer = function(__parent){
            __super=__parent;
        };
        return FaviconHandler;
        function FaviconHandler() {
            return __super.apply(this, arguments);
        }
    })();
    module.define('class', FaviconHandler);
    module.export("default", FaviconHandler);
    return {
        setters:[
            function (handler_1_1) {
                handler_1 = handler_1_1;
            }],
        execute: function() {
            FaviconHandler = module.init(FaviconHandler,handler_1.default);
        }
    }
});
//# sourceMappingURL=favicon.js.map