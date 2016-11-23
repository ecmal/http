import Node from '../node';
import {Server} from '../server';
import {Mime} from '../mime';
import {Handler} from './handler';
import {Result} from '../rest';
import {Class} from "runtime/reflect/class";
import {Method} from "runtime/reflect/method";
import {Member} from "runtime/reflect/member";
import {Constructor} from "runtime/reflect/constructor";
import {RestRoute} from "./rest";

export class EcmalTemplate{
    static template = [`
    var __t,__p='';
    with(obj||{}){
        __p+='"REPLACEMENT"
    }
    return __p`,`';
        "EVALUATE"
        __p+='`,`'+
        ((__t=("ESCAPE"))==null?'':EcmalTemplate.escape(__t))+
        '`,`'+
        ((__t=("INTERPOLATE"))==null?'':__t)+
        '`
    ];

    static settings = {
        evaluate    : /<%([\s\S]+?)%>/g,
        interpolate : /<%=([\s\S]+?)%>/g,
        escape      : /<%-([\s\S]+?)%>/g
    };

    static matcher  = RegExp([
            (EcmalTemplate.settings.escape || /(.)^/).source,
            (EcmalTemplate.settings.interpolate || /(.)^/).source,
            (EcmalTemplate.settings.evaluate || /(.)^/).source
        ].join('|') + '|$', 'g');

    static escapeConfig = {
        htmlEscapeMap :{
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            '"': '&quot;',
            "'": '&#x27;',
            '`': '&#x60;'
        }
    };

    static normalizerConfig = {
        normalizer : {
            "'":      "'",
            '\\':     '\\',
            '\r':     'r',
            '\n':     'n',
            '\u2028': 'u2028',
            '\u2029': 'u2029',
        },
        marcher : /\\|'|\r|\n|\u2028|\u2029/g
    };

    static escape(string:string):string{
        var source = '(?:' + Object.keys(this.escapeConfig.htmlEscapeMap).join('|') + ')';
        var testRegexp = RegExp(source);
        var replaceRegexp = RegExp(source, 'g');
        string = string == null ? '' : '' + string;
        return testRegexp.test(string) ? string.replace(replaceRegexp, (match)=>{return this.escapeConfig.htmlEscapeMap[match]}) : string;
    }

    static render(text:string,options:any){
        try {
            var index = 0,source='';
            text.replace(this.matcher, (match, escape, interpolate, evaluate, offset) => {
                source += text.slice(index, offset).replace(this.normalizerConfig.marcher, (match)=>{return '\\' + this.normalizerConfig.normalizer[match]});
                index = offset + match.length;
                if (escape) {
                    source+=this.template[2].replace('"ESCAPE"',escape);
                } else if (interpolate) {
                    source+=this.template[3].replace('"INTERPOLATE"',interpolate);

                } else if (evaluate) {
                    source+=this.template[1].replace('"EVALUATE"',evaluate)
                }
                return match;
            });
            source += "';\n";
            source = this.template[0].replace('"REPLACEMENT"',source);
            var render = new Function('obj', 'EcmalTemplate', source);
            return render.apply(options,[options,EcmalTemplate]);
        } catch (e) {
            if(e instanceof ReferenceError){
                let fName  = e.message.split(' ')[0],
                    reg = new RegExp(`[\\s][\\s\\S][\\s\\S]{0,50}(${fName})[\\s\\S]{0,50}[\\s]`,'g'),
                    matched = text.match(reg)[0].trim();
                e.details = EcmalTemplate.escape(matched);
            }
            throw e;
        }
    }

    static renderErrorDetails(e){
    var template =`<html>
    <head></head>
</html>
<body>
    <h2 style="color:red">Template parse error:</h2>
    <div>error       : ${e.message}</div>
    ${(e.details)? `<div>details : ... ${e.details} ... </div>`: ''}
    <div>filename    : ${e.filename}</div>

</body>`;
    return template;
    }
}

export class ViewRoute extends RestRoute{
    public templatePath :string;
    constructor(path:string,method:Method,templatePath:string){
        super(path,method);
        this.templatePath = templatePath;
    }
}

@Server.handler('view')
export class ViewHandler extends Handler {
    static get routes():{[k:string]:ViewRoute}{
        return Object.defineProperty(this,'routes',{
            enumerable:true,
            value:Object.create(null)
        }).routes;
    }
    static register(path,resource:Class){
        resource.getMembers(m=>ViewRoute.isActionMethod(m)).forEach((method:Method)=>{
            let templatePath = method.metadata.template_path;
            if(!templatePath){
                throw new Error(`Method should have 'Template' annotation`);
            }
            let route = new ViewRoute(path,method,templatePath);
            let routeId = route.toString();
            if(!this.routes[routeId]){
                this.routes[routeId] = route;
            }else{
                route = this.routes[routeId];
                throw new Error(`Cant route '${method.toString()}' to '${path}' it's already bounded to ${route.method.toString()}`);
            }
        });
    }

    private config:any;

    constructor(){
        super();
        this.config = ViewHandler.config;
    }
    accept(req,res){

    }
    handle(req,res){
        var url = Node.Url.parse(req.url,true);
        var root = this.config.path;
        var method = req.method.toUpperCase();
        var headers = req.headers;
        var query = url.query;
        var route,matched,path = method+' '+url.pathname;
        for(var r in ViewHandler.routes){
            route = ViewHandler.routes[r];
            if(matched = route.match(path)){
                break;
            }
        }
        if(matched){
            res.taken = true;
            matched.shift();
            var match = route.toJSON();
            match.params = {};
            match.query = query;
            match.headers = headers;
            route.params.forEach((p,i)=>{
                match.params[p] = matched[i];
            });
            var promise = Promise.resolve(
                (req.body&&req.body.length)
                    ?JSON.parse(req.body.toString())
                    :null
            );
            promise = promise.then(body=>{
                if(match.body = body){
                    matched.push(body);
                }
                match.matched = matched;
                return route.execute(match)
            });
            promise = promise.then(result=>{
                if(result == null || typeof result == 'undefined'){
                    return Result.create({});
                }
                if(result instanceof Result){
                    return result;
                }else{
                    return Result.create(result);
                }
            });
            promise = promise.then((result:Result)=>{
                return new Promise((resolve,reject)=>{
                    Node.Fs.readFile(Node.Path.resolve(root,(route.templatePath)).toString(),(err,data)=>{
                        if(err){reject( new Error("Tpl file not found"));return;}
                        try{
                            result.value = EcmalTemplate.render(data.toString(),result.value);
                        }catch (e){
                            e.filename = route.templatePath;
                            reject(Result.create(EcmalTemplate.renderErrorDetails(e),500));
                        }
                        resolve(result);
                    });
                })
            });
            promise = promise.catch(result=>{
                if(result instanceof Result){
                    return result;
                }else
                if(result instanceof Error){
                    return Result.create({
                        error   : result.message,
                        code    : result.code||500,
                        details : result.details,
                        stack   : result.stack.split("\n")
                    },500);
                }else{
                    return Result.create({
                        error   : 'Unknown Server Error',
                        code    : 500,
                        data    : result
                    },500);
                }
            });
            promise = promise.then(result=>{
                result.headers['Content-Type'] = Mime.getType('.tpl');
                res.writeHead(result.status,result.headers);
                if(typeof result.value!="string"){
                    res.end(JSON.stringify(result.value));
                }else{
                    res.write(result.value);
                    res.end();
                }

            });

            return promise;
        }
    }
}