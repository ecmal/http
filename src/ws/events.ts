export interface EventTarget {
    onopen    : (event)=>void;
    onmessage : (event)=>void;
    onerror   : (event)=>void;
    onclose   : (event)=>void;
    addEventListener(eventType:string, listener:(event)=>void, useCapture?:boolean);
    removeEventListener(eventType:string, listener:(event)=>void, useCapture?:boolean);
    dispatchEvent(event:Event);
}

export class Event {
    static CAPTURING_PHASE = 1;
    static AT_TARGET       = 2;
    static BUBBLING_PHASE  = 3;

    public type:string;
    public bubbles:boolean;
    public cancelable:boolean;
    constructor(eventType, options?) {
        this.type = eventType;
        if(options){
            for (var key in options){
                this[key] = options[key];
            }
        }
    }
    public initEvent(eventType, canBubble, cancelable){
        this.type       = eventType;
        this.bubbles    = canBubble;
        this.cancelable = cancelable;
    }
    public stopPropagation() {}
    public preventDefault() {}
}

