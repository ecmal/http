export default class HttpHandler {

    private $:any;

    get settings(){
        return this.$.settings;
    }
    constructor(settings){
        this.configure(settings)
    }
    configure(settings){
        this.$ = {
            settings : settings
        };
        return this;
    }
    initialize(server){
        console.info(`Initializeing ${this.constructor.name}`);
    }
    handle(req,res){
        throw new Error(`Unimplemented Method 'handler' in class ${this.constructor.name}`)
    }
}


