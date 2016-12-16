import { Handler } from './handler';
export declare class FileRoute {
    private pattern;
    private location;
    constructor(settings: any);
    private match(url);
    private toString();
}
export declare class FileHandler extends Handler {
    config: any;
    routes: any;
    constructor();
    private resource(path);
    private accept(req, res);
    private handle(req, res);
}
