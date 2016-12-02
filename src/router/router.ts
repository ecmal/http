import Node from '../node';
import {Server} from '../server';
import {Mime} from '../mime';
import {Class} from "runtime/reflect/class";
import {Method} from "runtime/reflect/method";
import {Member} from "runtime/reflect/member";
import {Constructor} from "runtime/reflect/constructor";
import {Decorator} from "runtime/decorators";
export interface PathOptions {
    sensitive?:boolean;
    strict?:boolean;
    end?:boolean;
    delimiter?:string;
}
export class Path extends Decorator {
    public path:string;
    public options:PathOptions;
    constructor(path,options?:PathOptions){
        super();
        this.path = path;
        this.options = options||{};
    }
    decorate(member:Member){
        if(member instanceof Constructor){
            Router.register(this.path,member.owner,this.options);
        }else{
            throw new Error(`Invalid 'Path' target ${member.toString()}`);
        }
    }
}


export class Result {

    public value:any;
    public status:any;
    public headers:any;

    static create(value,status?,headers?){
        return new Result(value,status,headers);
    }

    constructor(value,status?,headers?){
        this.value=value;
        this.status = status;
        this.headers = headers;
    }
}

export class Route {
    static ACTIONS = ['GET','POST','PUT','PATCH','DELETE','HEAD'];

    static pathRegexp =  new RegExp([
        '(\\\\.)','([\\/.])?(?:(?:\\:(\\w+)(?:\\(((?:\\\\.|[^\\\\()])+)\\))?|\\(((?:\\\\.|[^\\\\()])+)\\))([+*?])?|(\\*))'
    ].join('|'), 'g');


    static isActionMethod(m:Member){
        return (m instanceof Method && Route.ACTIONS.indexOf(m.name.toUpperCase())>=0);
    }

    static escapeString (str) {
        return str.replace(/([.+*?=^!:${}()[\]|\/\\])/g, '\\$1');
    }

    static escapeGroup (group) {
        return group.replace(/([=!:$\/()])/g, '\\$1')
    }

    static explodePath (str, options) {
        var tokens = [];
        var key = 0;
        var index = 0;
        var path = '';
        var defaultDelimiter = options && options.delimiter || '/';
        var res;

        while ((res = Route.pathRegexp.exec(str)) != null) {
            var m = res[0];
            var escaped = res[1];
            var offset = res.index;
            path += str.slice(index, offset);
            index = offset + m.length;

            // Ignore already escaped sequences.
            if (escaped) {
                path += escaped[1];
                continue
            }

            var next = str[index];
            var prefix = res[2];
            var name = res[3];
            var capture = res[4];
            var group = res[5];
            var modifier = res[6];
            var asterisk = res[7];

            // Push the current path onto the tokens.
            if (path) {
                tokens.push(path);
                path = ''
            }

            var partial = prefix != null && next != null && next !== prefix;
            var repeat = modifier === '+' || modifier === '*';
            var optional = modifier === '?' || modifier === '*';
            var delimiter = res[2] || defaultDelimiter;
            var pattern = capture || group;

            tokens.push({
                name: name || key++,
                prefix: prefix || '',
                delimiter: delimiter,
                optional: optional,
                repeat: repeat,
                partial: partial,
                asterisk: !!asterisk,
                pattern: pattern ? Route.escapeGroup(pattern) : (asterisk ? '.*' : '[^' + Route.escapeString(delimiter) + ']+?')
            })
        }

        // Match any characters still remaining.
        if (index < str.length) {
            path += str.substr(index)
        }

        // If the path exists, push it onto the end.
        if (path) {
            tokens.push(path)
        }
        return tokens
    }

    public method:Method;
    public path:string;
    public options:PathOptions;
    public params:any = [];
    public regexp:any;
    public action:string;

    constructor(path:string,method:Method,options?:PathOptions){
        this.method  = method;
        this.action  = method instanceof Constructor ? 'GET' : this.method.name.toUpperCase();
        this.path    = path;
        this.options = options;
        this.createMatcher(Route.explodePath(path,this.options));
    }

    createMatcher ( tokens ) {
        var options = this.options;
        var strict = options.strict;
        var end = options.end !== false;
        var keys = [];
        var route = '';

        // Iterate over the tokens and create our regexp string.
        for (var i = 0; i < tokens.length; i++) {
            var token = tokens[i];

            if (typeof token === 'string') {
                route += Route.escapeString(token)
            } else {
                var prefix = Route.escapeString(token.prefix);
                var capture = '(?:' + token.pattern + ')';

                this.params.push(token.name);

                if (token.repeat) {
                    capture += '(?:' + prefix + capture + ')*'
                }

                if (token.optional) {
                    if (!token.partial) {
                        capture = '(?:' + prefix + '(' + capture + '))?'
                    } else {
                        capture = prefix + '(' + capture + ')?'
                    }
                } else {
                    capture = prefix + '(' + capture + ')'
                }

                route += capture
            }
        }

        var delimiter = Route.escapeString(options.delimiter || '/');
        var endsWithDelimiter = route.slice(-delimiter.length) === delimiter;

        // In non-strict mode we allow a slash at the end of match. If the path to
        // match already ends with a slash, we remove it for consistency. The slash
        // is valid at the end of a path match, not in the middle. This is important
        // in non-ending mode, where "/test/" shouldn't match "/test//route".
        if (!strict) {
            route = (endsWithDelimiter ? route.slice(0, -delimiter.length) : route) + '(?:' + delimiter + '(?=$))?'
        }

        if (end) {
            route += '$'
        } else {
            // In non-ending mode, we need the capturing groups to match as much as
            // possible by using a positive lookahead to the end or next path segment.
            route += strict && endsWithDelimiter ? '' : '(?=' + delimiter + '|$)'
        }
        this.regexp = new RegExp('^' + this.action +"\\s" + route, options.sensitive ? '' : 'i');
    }

    match(path){
        return path.match(this.regexp);
    }
    execute(options:any,...args):any{
        //route.resource.prototype[route.action].apply(resource,matched);
        let instance = new (<any>this.method.owner.value)(...args);
        Object.defineProperties(instance,{
            path     : {value:options.path},
            query    : {value:options.query},
            params   : {value:options.params},
            headers  : {value:options.headers},
            body     : {value:options.body},
        });
        if(this.method instanceof Constructor){
            return instance;
        }else{
            return this.method.invoke(instance,...options.matched);
        }

    }
    toJSON(){
        return {
            method    : this.method.toString(),
            path      : this.path,
            params    : this.params,
            regexp    : this.regexp.toString()
        }
    }
    toString(){
        return 'Route('+this.regexp.toString()+')';
    }
}

export class Router{
    static get routes():{[k:string]:Route}{
        return Object.defineProperty(this,'routes',{
            enumerable:true,
            value:Object.create(null)
        }).routes;
    }
    static register(path,resource:Class,options:PathOptions){
        resource.getMembers(m=>Route.isActionMethod(m)).forEach((method:Method)=>{
            let route = new Route(path,method,options);
            let routeId = route.toString();
            if(!this.routes[routeId]){
                this.routes[routeId] = route;
            }else{
                route = this.routes[routeId];
                throw new Error(`Cant route '${method.toString()}' to '${path}' it's already bounded to ${route.method.toString()}`);
            }
        });
    }

    route(options){
        var route,matched,path = options.method+' '+options.pathname;
        for(var r in Router.routes){
            route = Router.routes[r];
            if(matched = route.match(path)){
                break;
            }
        }
        if(!matched){
            console.log(`There is not marched route for "${options.pathname}"`);
            return Promise.reject(null);
        }
        matched.shift();
        var match = route.toJSON();
        match.params = {};
        match.query = options.search;
        route.params.forEach((p,i)=>{
            match.params[p] = matched[i];
        });

        var promise = Promise.resolve(null);
        promise = promise.then(body=>{
            if(match.body = body){
                matched.push(body);
            }
            match.matched = matched;

            return route.execute(match)
        });

        promise = promise.then(result=>{
            if(result == null || typeof result == 'undefined'){
                return Result.create(null);
            }
            if(result instanceof Result){
                return result;
            }else{
                return Result.create(result);
            }
        });
        promise = promise.catch(result=>{
            if(result == null || typeof result == 'undefined'){
                return Result.create(null);
            }
            if(result instanceof Result){
                return result;
            }else
            if(result instanceof Error){
                return Result.create({
                    error   : result.message,
                    details : result.details,
                    stack   : result.stack.split("\n")
                });
            }else{
                return Result.create({
                    error   : 'Unknown Error',
                    data    : result
                });
            }
        });

        return promise;

    }
}

