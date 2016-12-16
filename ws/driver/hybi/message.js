system.register("http/ws/driver/hybi/message", [], function(system,module,jsx) {
    var Message = (function (__super) {
        Message.prototype.read = function () {
            if (this.data)
                return this.data;
            this.data = new Buffer(this.length);
            var offset = 0;
            for (var i = 0, n = this._chunks.length; i < n; i++) {
                this._chunks[i].copy(this.data, offset);
                offset += this._chunks[i].length;
            }
            return this.data;
        };
        Message.prototype.pushFrame = function (frame) {
            this.rsv1 = this.rsv1 || frame.rsv1;
            this.rsv2 = this.rsv2 || frame.rsv2;
            this.rsv3 = this.rsv3 || frame.rsv3;
            if (this.opcode === null)
                this.opcode = frame.opcode;
            this._chunks.push(frame.payload);
            this.length += frame.length;
        };
        return Message;
        function Message() {
            this.rsv1 = false;
            this.rsv2 = false;
            this.rsv3 = false;
            this.opcode = null;
            this.length = 0;
            this._chunks = [];
        }
    })();
    module.define('class', Message);
    module.export("Message", Message);
    return {
        setters:[],
        execute: function() {
            Message = module.init(Message);
        }
    }
});
//# sourceMappingURL=message.js.map