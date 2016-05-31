import { Handler } from './handler';
export declare class FileRoute {
    private pattern;
    private location;
    constructor(settings: any);
    match(url: any): any;
    toString(): string;
}
export declare class FileHandler extends Handler {
    config: any;
    routes: any;
    constructor();
    resource(path: any): any;
    accept(req: any, res: any): void;
    handle(req: any, res: any): void;
}
