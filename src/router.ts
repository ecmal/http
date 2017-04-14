const sepReg = /\|/
const multiSlashReg = /(\/){2,}/
const maybeRegex = /[?^{}()|[\]\\]/
const regexReg = /^([^\(\n\r\u2028\u2029]*)(\(.+\))$/
const parameterReg = /^(.*)(:\w+\b)(.*)$/
const escapeReg = /[.*+?^${}()|[\]\\]/g
const trimSlashReg = /(^\/)|(\/$)/g

export class Route<T> {
    public state:RouteState<T>;
    public data:T;
    constructor (parentNode, frag, matchRemains=false) {
        Object.defineProperty(this, 'state', {
            enumerable: false,
            configurable: false,
            writable: false,
            value: new RouteState(parentNode, frag, matchRemains)
        })
    }
}

export class RouteState<T> {
    
    public name:string;
    public pattern:string;
    public endpoint:boolean;
    public parentNode:Route<T>;
    public matchRemains:boolean;
    public childNodes:MapLike<any>;
    public regexNames:MapLike<any>;
    public regexNodes:Array<RouteRegex<T>>;

    constructor (parentNode, frag, matchRemains) {
        this.name = frag;
        this.pattern = null;
        this.endpoint = false;
        this.parentNode = parentNode;
        this.matchRemains = !!matchRemains;
        this.childNodes = Object.create(null);
        this.regexNames = Object.create(null);
        this.regexNodes = [];
    }

}

export class RouteRegex<T> {
    
    public node:Route<T>;
    public prefix:string;
    public param:string;
    public regex:RegExp;

    constructor (node, prefix, param, regex) {
        this.node = node
        this.prefix = prefix || ''
        this.param = param || ''
        this.regex = regex || null
    }

}

export class Match<T> {
    public node:Route<T>;
    public nodes:Route<T>[];
    public params:MapLike<any>;
    constructor() {
        this.node = null;
        this.nodes = [];
        this.params = {};
    }
}

export class Router<T=any> {
    static get routers():MapLike<Router>{
        return Object.defineProperty(this,'routers',{
            value : Object.create(null)
        }).routers;
    }
    static get default(){
        return this.get('default')
    }
    static get<T>(name:string):Router<T>{
        if(!this.routers[name]){
            Object.defineProperty(this.routers,name,{
                value : new Router<T>()
            });
        }
        return this.routers[name];
    }
    static  safeDecodeURIComponent (string) {
        try {
            return decodeURIComponent(string)
        } catch (err) {
            return false
        }
    }
    public root:Route<T>;
    public flags:string;
    public nodes:MapLike<Route<T>>;
    constructor (ignoreCase?:boolean) {
        this.flags = ignoreCase ? 'i' : '';
        this.root = new Route<T>(null, 'root')
        this.nodes = Object.create(null);
    }
    public define(pattern:string,data?:T):Route<T>{
        if (typeof pattern !== 'string'){
             throw new TypeError('Pattern must be string.');
        }
        if (multiSlashReg.test(pattern)){
             throw new Error('Multi-slash exist.');
        }
        if (!(this.nodes[pattern] instanceof Route)) {
            let _pattern = pattern.replace(trimSlashReg, '');
            let node = define(this.root, _pattern.split('/'), this.flags);
            if (node.state.pattern == null) {
                node.state.pattern = pattern;
            }
            this.nodes[pattern] = node;
        }
        return this.nodes[pattern];
    }
    public match(path, multiMatch?):Match<T> {
        // the path should be normalized before match, just as path.normalize do in Node.js
        if (typeof path !== 'string'){
            throw new TypeError('Path must be string.')
        }
        path = path.replace(trimSlashReg, '');

        let node = this.root
        let frags = path.split('/')
        let matched = new Match<T>()

        while(frags.length) {
            node = matchNode(node, frags, matched.params, this.flags)
            // matched
            if (node) {
                if (multiMatch && node.state.endpoint){
                    matched.nodes.push(node)
                }
                continue;
            }
            // not match
            return multiMatch ? matched : null
        }
        matched.node = node
        if (!multiMatch && !node.state.endpoint){
             return null;
        }
        return matched;
    }
}

function define<T>(parentNode:Route<T>, frags:string[], flags:string):Route<T>{
    let frag = frags.shift()
    let child = parseNode(parentNode, frag, flags)

    if (!frags.length) {
        child.state.endpoint = true
        return child
    }
    if (child.state.matchRemains) {
        throw new Error('Can not define regex pattern after "(*)" pattern.')
    }
    return define(child, frags, flags)
}

function matchNode<T>(node:Route<T>, frags:string[], params:MapLike<any>, flags:string):Route<T> {
    let frag = Router.safeDecodeURIComponent(frags.shift())
    if (frag === false){
        return null;
    }

    let childNodes = node.state.childNodes;
    let child = childNodes[flags ? frag.toLowerCase() : frag]
    if (child) return child

    let regexNodes = node.state.regexNodes

    for (let fragCopy, regexNode, i = 0, len = regexNodes.length; i < len; i++) {
        fragCopy = frag
        regexNode = regexNodes[i]

        if (regexNode.prefix) {
            if (fragCopy.indexOf(regexNode.prefix) !== 0) continue;
            fragCopy = fragCopy.slice(regexNode.prefix.length)
        }

        if (regexNode.regex && !regexNode.regex.test(fragCopy)) continue
        if (regexNode.node.state.matchRemains) {
            while (frags.length) {
                let remain = Router.safeDecodeURIComponent(frags.shift())
                if (remain === false) return null
                fragCopy += '/' + remain
            }
        }
        if (regexNode.param) {
            params[regexNode.param] = fragCopy;
        }
        child = regexNode.node;
        break;
    }
    return child;
}

function parseNode<T>(parentNode:Route<T>, frag:string, flags:string):Route<T>{
    let res = null
    let regexs = '';
    let regex = null;
    let prefix = ''
    let parameter = ''
    let matchRemains = false
    let childNodes = parentNode.state.childNodes
    let regexNames = parentNode.state.regexNames
    let regexNodes = parentNode.state.regexNodes

    if (childNodes[frag]) return childNodes[frag]
    checkMatchRegex(frag, '', parentNode.state)

    if ((res = parameterReg.exec(frag))) {
        // case: `prefix:name(regex)`
        prefix = res[1]
        parameter = res[2].slice(1)
        regexs = res[3]
        if (regexs && !regexReg.test(regexs)) {
            throw new Error('Can not parse "' + regexs + '" as regex pattern')
        }
    } else if ((res = regexReg.exec(frag))) {
        // case: `prefix(regex)`
        prefix = res[1]
        regexs = res[2]
    } else if (sepReg.test(frag)) {
        // case: `a|b|c`
        regexs = wrapSepExp(frag)
    } else if (maybeRegex.test(frag)) {
        throw new Error('Can not parse "' + frag + '"')
    } else {
        // case: other simple string node
        childNodes[frag] = new Route(parentNode, frag)
        return childNodes[frag]
    }

    if (regexs === '(*)') {
        regexs = '(.*)'
        matchRemains = true
    }

    if (regexs){
         regexs = '^' + regexs + '$'
    }
    // normalize frag as regex node name
    let regexName = prefix + ':' + regexs
    // if regex node exist
    if (regexNames[regexName]){
         return regexNodes[regexNames[regexName]].node;
    }

    if (prefix){
         checkMatchRegex(frag, prefix, parentNode.state)
    }
    let node = new Route<T>(parentNode, regexName, matchRemains)
    if (regexs) {
        regex = new RegExp(regexs, flags)
    }
    regexNames[regexName] = '' + regexNodes.length
    regexNodes.push(new RouteRegex<T>(node, prefix, parameter, regex))
    return node;
}

function checkMatchRegex (frag, prefix, parentNodeState) {
    let regexNode = parentNodeState.regexNames[prefix + ':^(.*)$']
    if (regexNode) {
        let pattern = parentNodeState.regexNodes[regexNode].node.state.pattern
        throw new Error('Can not define "' + frag + '" after "' + pattern + '".')
    }
}

function wrapSepExp (str) {
    let res = str.split('|')
    for (let i = 0, len = res.length; i < len; i++) {
        if (!res[i]) throw new Error('Can not parse "' + str + '" as separated pattern')
        res[i] = res[i].replace(escapeReg, '\\$&')
    }
    return '(' + res.join('|') + ')'
}