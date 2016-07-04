export declare class Pledge {
    static QUEUE_SIZE: number;
    static all(list: any): Pledge;
    protected _complete: any;
    private _callbacks;
    constructor();
    then(callback: any): void;
    done(): void;
}
