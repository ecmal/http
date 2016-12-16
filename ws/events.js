system.register("http/ws/events", [], function(system,module,jsx) {
    var EventTarget = module.define("interface","EventTarget");
    var Event = (function (__super) {
        Event.prototype.initEvent = function (eventType, canBubble, cancelable) {
            this.type = eventType;
            this.bubbles = canBubble;
            this.cancelable = cancelable;
        };
        Event.prototype.stopPropagation = function () { };
        Event.prototype.preventDefault = function () { };
        Event.__initializer = function(__parent){
            __super=__parent;
            Event.CAPTURING_PHASE = 1;
            Event.AT_TARGET = 2;
            Event.BUBBLING_PHASE = 3;
        };
        return Event;
        function Event(eventType, options) {
            this.type = eventType;
            if (options) {
                for (var key in options) {
                    this[key] = options[key];
                }
            }
        }
    })();
    module.define('class', Event);
    module.export("Event", Event);
    return {
        setters:[],
        execute: function() {
            Event = module.init(Event);
        }
    }
});
//# sourceMappingURL=events.js.map