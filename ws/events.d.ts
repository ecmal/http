export interface EventTarget {
    onopen: (event) => void;
    onmessage: (event) => void;
    onerror: (event) => void;
    onclose: (event) => void;
    addEventListener(eventType: string, listener: (event) => void, useCapture?: boolean): any;
    removeEventListener(eventType: string, listener: (event) => void, useCapture?: boolean): any;
    dispatchEvent(event: Event): any;
}
export declare class Event {
    static CAPTURING_PHASE: number;
    static AT_TARGET: number;
    static BUBBLING_PHASE: number;
    type: string;
    bubbles: boolean;
    cancelable: boolean;
    constructor(eventType: any, options?: any);
    initEvent(eventType: any, canBubble: any, cancelable: any): void;
    stopPropagation(): void;
    preventDefault(): void;
}
