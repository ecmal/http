import Node from '../node';

import {Server} from '../server';
import {Mime} from '../mime';
import {Handler} from './handler';

export class FileRoute {
    private pattern:any;
    private location:any;
    constructor(settings){
        if(typeof settings=='string'){
            settings = [/^\/(.*)$/i,`${settings}/$1`];
        }
        this.pattern = settings.shift();
        this.location = settings.shift();
    }
    private match(url){
        if(url.match(this.pattern)){
            return url.replace(this.pattern,this.location);
        }
    }
    private toString(){
        return `Route(${this.pattern} -> ${this.location})`
    }
}

@Server.handler('files')
export class FileHandler extends Handler {
    config:any;
    routes:any;
    constructor(){
        super();
        this.config = FileHandler.config;
        this.routes = [];
        if(typeof this.config.path=='string'){
            this.config.path=[this.config.path];
        }
        this.config.path.forEach(p=>{
            this.routes.push(new FileRoute(p));
        });
    }
    private resource(path){
        try {
            var stat = Node.Fs.statSync(path);
            if (stat.isDirectory()) {
                return this.resource(Node.Path.resolve(path, 'index.html'));
            } else
            if (stat.isFile()) {
                return {exist:true,path:path,stat:stat};
            } else {
                return {exist:false,path:path,stat:stat};
            }
        }catch(e){
            return {exist:false,path:path,stat:stat};
        }
    }
    private accept(req,res){

    }

    private prepareResponseHead(req,res,file){
        let reqCacheControl = req.headers['cache-control'],
            reqIfModifiedSince = req.headers['if-modified-since'],
            head = {'headers' : {'Content-Type'  : Mime.getType(file.path)},'status':200},
            lasModifiedTime = file.stat.mtime,
            isCacheEnabled = (reqCacheControl !='no-cache') && this.config.cache;
        if(isCacheEnabled){
            head.headers['Cache-Control']    = 'public, max-age=86400';
            head.headers['Expires']          = new Date(new Date().getTime()+86400000).toUTCString();
            head.headers['Last-Modified']   = lasModifiedTime.toUTCString();
            if(reqIfModifiedSince && lasModifiedTime.getTime() <= new Date(reqIfModifiedSince).getTime()) {
                head.status = 304;
            }
        }else{
            head.headers['Cache-Control'] = 'no-cache, no-store, must-revalidate';
        }
        return head;
    }
    private handle(req,res){
        var path = req.url.split('?')[0];
        for(var file,i=0;i<this.routes.length;i++){
            file = this.routes[i].match(path);
            if(file && (file = this.resource(file)).exist){
                break;
            }
        }
        if(file && file.exist){
            let head = this.prepareResponseHead(req,res,file);
            res.writeHead(head.status,head.headers);
            if(head.status == 304 ){
                res.end();
            }else{
                Node.Fs.createReadStream(file.path).pipe(res);
            }
        }else{
            res.writeHead(404,{
                'Content-Type' : Mime.getType(file?file.path:req.url)
            });
            res.end('File Not Found');
        }
    }
}