import {Class} from "runtime/reflect/class";
import {Constructor} from "runtime/reflect/constructor";
import {Decorator} from "runtime/decorators";
import {Cached} from "runtime/decorators";

export class Path extends Decorator {
    public path:string;
    public options:any;
    constructor(path,options?:{
        sensitive?:boolean;
        strict?:boolean;
        end?:boolean;
        delimiter?:string;
    }){
        super();
        this.path = path;
        this.options = options||{};
    }
    decorate(member:Constructor){
        if(member instanceof Constructor){
            new Route(this.path,member.owner,this.options);
        }else{
            throw new Error(`Invalid 'Path' target ${member.toString()}`);
        }
    }
}

export class Route {
    @Cached
    static routes:Map<string,Route>;
    static route(path,options,...args):any{
        var r,matched,route,params={},routes=this.routes.values(),r=routes.next();
        while(!r.done){
            route = r.value;
            if(matched = route.match(path)){
                break;
            }
            r=routes.next();
        }
        if(!matched){
            console.log(`There is not marched route for "${options.pathname}"`);
            return Promise.reject(null);
        }
        matched.shift();
        route.params.forEach((p,i)=>{
            params[p] = matched[i];
        });
        options.params = params;
        return Promise.resolve().then(()=>{
            route.execute(options,matched.concat(args));
            return params;
        });
    }

    public path:string;
    public options:any;
    public params:any = [];
    public regexp:any;
    public target:Class;

    constructor(path:string,target:Class,options?:{
        sensitive?:boolean;
        strict?:boolean;
        end?:boolean;
        delimiter?:string;
    }){
        let old = Route.routes.get(path);
        if(old){
            throw new Error(`Cant route '${path}' to ${target.toString()} it's already bounded to ${old.target.toString()}`);
        }else{
            Route.routes.set(path,this);
        }
        function escapeString (str) {
            return str.replace(/([.+*?=^!:${}()[\]|\/\\])/g, '\\$1');
        }
        function escapeGroup (group) {
            return group.replace(/([=!:$\/()])/g, '\\$1')
        }
        function explodePath (str, options) {
            var pathRegexp =  new RegExp([
                '(\\\\.)','([\\/.])?(?:(?:\\:(\\w+)(?:\\(((?:\\\\.|[^\\\\()])+)\\))?|\\(((?:\\\\.|[^\\\\()])+)\\))([+*?])?|(\\*))'
            ].join('|'), 'g');
            var tokens = [];
            var key = 0;
            var index = 0;
            var path = '';
            var defaultDelimiter = options && options.delimiter || '/';
            var res;

            while ((res = pathRegexp.exec(str)) != null) {
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
                    pattern: pattern ? escapeGroup(pattern) : (asterisk ? '.*' : '[^' + escapeString(delimiter) + ']+?')
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
        function createMatcher(keys){
            var tokens = explodePath(path,options);
            var strict = options.strict;
            var end = options.end !== false;
            var route = '';
            // Iterate over the tokens and create our regexp string.
            for (var i = 0; i < tokens.length; i++) {
                var token = tokens[i];

                if (typeof token === 'string') {
                    route += escapeString(token)
                } else {
                    var prefix = escapeString(token.prefix);
                    var capture = '(?:' + token.pattern + ')';

                    keys.push(token.name);

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
            var delimiter = escapeString(options.delimiter || '/');
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
            return new RegExp('^'+ route, options.sensitive ? '' : 'i');
        }
        this.path = path;
        this.target = target;
        this.params=[];
        this.regexp = createMatcher(this.params);
    }



    match(path){
        return path.match(this.regexp);
    }
    execute(instance:any,...args):any{
        Object.defineProperty(instance,'constructor',{
            configurable : true,
            value : this.target.value
        });
        Object.setPrototypeOf(instance,this.target.value);
        this.target.value.apply(instance,args);
        return instance;
    }
    toJSON(){
        return {
            method    : this.target.toString(),
            path      : this.path,
            params    : this.params,
            regexp    : this.regexp.toString()
        }
    }
    toString(){
        return 'Route('+this.regexp.toString()+')';
    }
}
