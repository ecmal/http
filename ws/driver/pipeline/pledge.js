system.register("http/ws/driver/pipeline/pledge", ["./ring_buffer"], function(system,module,jsx) {
    var ring_buffer_1;
    var Pledge = (function (__super) {
        Pledge.all = function (list) {
            var pledge = new Pledge(), pending = list.length, n = pending;
            if (pending === 0)
                pledge.done();
            while (n--)
                list[n].then(function () {
                    pending -= 1;
                    if (pending === 0)
                        pledge.done();
                });
            return pledge;
        };
        Pledge.prototype.then = function (callback) {
            if (this._complete)
                callback();
            else
                this._callbacks.push(callback);
        };
        Pledge.prototype.done = function () {
            this._complete = true;
            var callbacks = this._callbacks, callback;
            while (callback = callbacks.shift())
                callback();
        };
        Pledge.__initializer = function(__parent){
            __super=__parent;
            Pledge.QUEUE_SIZE = 4;
        };
        return Pledge;
        function Pledge() {
            this._complete = false;
            this._callbacks = new ring_buffer_1.RingBuffer(Pledge.QUEUE_SIZE);
        }
    })();
    module.define('class', Pledge);
    module.export("Pledge", Pledge);
    return {
        setters:[
            function (ring_buffer_1_1) {
                ring_buffer_1 = ring_buffer_1_1;
            }],
        execute: function() {
            Pledge = module.init(Pledge);
        }
    }
});
//# sourceMappingURL=pledge.js.map