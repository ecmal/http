system.register("http/ws/driver/hybi/frame", [], function(system,module,jsx) {
    var Frame = (function (__super) {
        return Frame;
        function Frame() {
            this.final = false;
            this.rsv1 = false;
            this.rsv2 = false;
            this.rsv3 = false;
            this.opcode = null;
            this.masked = false;
            this.maskingKey = null;
            this.lengthBytes = 1;
            this.length = 0;
            this.payload = null;
        }
    })();
    module.define('class', Frame);
    module.export("Frame", Frame);
    return {
        setters:[],
        execute: function() {
            Frame = module.init(Frame);
        }
    }
});
//# sourceMappingURL=frame.js.map