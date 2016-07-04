system.register("http/ws/driver/pipeline", ["./pipeline/cell", "./pipeline/pledge"], function(system,module,jsx) {
    var cell_1, pledge_1;
    var Pipeline = (function (__super) {
        Pipeline.prototype.processIncomingMessage = function (message, callback, context) {
            //console.info('incoming',message.opcode,message.length);
            if (this._stopped.incoming) {
                return;
            }
            this._loop('incoming', this._cells.length - 1, -1, -1, message, callback, context);
        };
        Pipeline.prototype.processOutgoingMessage = function (message, callback, context) {
            //console.info('outgoing',message.opcode,message.length);
            if (this._stopped.outgoing) {
                return;
            }
            this._loop('outgoing', 0, this._cells.length, 1, message, callback, context);
        };
        Pipeline.prototype.close = function (callback, context) {
            this._stopped = { incoming: true, outgoing: true };
            var closed = this._cells.map(function (a) { return a.close(); });
            if (callback) {
                pledge_1.Pledge.all(closed).then(function () {
                    callback.call(context);
                });
            }
        };
        Pipeline.prototype._loop = function (direction, start, end, step, message, callback, context) {
            var _this = this;
            var cells = this._cells, n = cells.length;
            while (n--) {
                cells[n].pending(direction);
            }
            var pipe = function (index, error, msg) {
                if (index === end) {
                    return callback.call(context, error, msg);
                }
                cells[index][direction](error, msg, function (err, m) {
                    if (err) {
                        _this._stopped[direction] = true;
                    }
                    pipe(index + step, err, m);
                });
            };
            pipe(start, null, message);
        };
        return Pipeline;
        function Pipeline(sessions) {
            this._cells = sessions.map(function (session) {
                return new cell_1.Cell(session);
            });
            this._stopped = {
                incoming: false,
                outgoing: false
            };
        }
    })();
    module.define('class', Pipeline);
    module.export("Pipeline", Pipeline);
    return {
        setters:[
            function (cell_1_1) {
                cell_1 = cell_1_1;
            },
            function (pledge_1_1) {
                pledge_1 = pledge_1_1;
            }],
        execute: function() {
            Pipeline = module.init(Pipeline);
        }
    }
});
//# sourceMappingURL=pipeline.js.map