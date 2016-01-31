System.register(['./node'], function(exports_1) {
    var node_1;
    var Mime;
    return {
        setters:[
            function (node_1_1) {
                node_1 = node_1_1;
            }],
        execute: function() {
            Mime = (function () {
                function Mime() {
                }
                Mime.getType = function (file) {
                    var ext = node_1.default.Path.extname(file) || '.html';
                    if (Mime.TYPES[ext]) {
                        return Mime.TYPES[ext];
                    }
                    else {
                        return ext;
                    }
                };
                Mime.TYPES = {
                    '.js': 'text/javascript',
                    '.json': 'application/json',
                    '.css': 'text/css',
                    '.html': 'text/html',
                    '.ts': 'application/x-typescript'
                };
                return Mime;
            })();
            exports_1("Mime", Mime);
        }
    }
});
//# sourceMappingURL=mime.js.map