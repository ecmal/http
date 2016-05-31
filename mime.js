system.register("http/mime", ['./node'], function(system,module) {
    var node_1;
    var Mime = (function (__super) {
        Mime.getType = function (file) {
            var ext = node_1.default.Path.extname(file) || '.html';
            if (Mime.TYPES[ext]) {
                return Mime.TYPES[ext];
            }
            else {
                return ext;
            }
        };
        Mime.__initializer = function(__parent){
            __super=__parent;
            Mime.TYPES = {
                '.js': 'text/javascript',
                '.json': 'application/json',
                '.css': 'text/css',
                '.html': 'text/html',
                '.ts': 'application/x-typescript',
                '.svg': 'image/svg+xml'
            };
        };
        return Mime;
        function Mime() {
        }
    })();
    module.define('class', Mime);
    module.export("Mime", Mime);
    return {
        setters:[
            function (node_1_1) {
                node_1 = node_1_1;
            }],
        execute: function() {
            Mime = module.init(Mime);
        }
    }
});
//# sourceMappingURL=mime.js.map