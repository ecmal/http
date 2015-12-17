export class Handler {
    static server:any;
    static config:any;
    static configure(server,config){
        this.server = server;
        this.config = config;
        return this;
    }
}