import {Buffer} from "@ecmal/node/buffer";
import {Resource} from "../resource";
import * as fs from '@ecmal/node/fs';
import * as path from '@ecmal/node/path';
import {Mime} from "../mime";

export interface StaticTrait extends Resource {
    configure(options:StaticOptions):void;
    writeFile(location?:string):Promise<boolean>;
}
export interface StaticOptions extends Object{
    dirname      :string;
    defaultType ?:string;
    indexFile   ?:string;
}
export function Static<T extends Constructor<Resource>>(Base: T):Constructor<StaticTrait>{
    return class StaticResource extends Base implements StaticTrait {
        protected options:StaticOptions = {
            dirname     : void 0,
            defaultType : 'application/octet-stream',
            indexFile   : 'index.html'
        }
        get dirname():string{
            return Object.defineProperty(this,'dirname',{
                value:path.join(process.cwd(),this.options.dirname)
            }).dirname;
        }
        public configure(options:StaticOptions){
            let opt = options || {};
            Object.keys(opt).forEach(key=>{
                if( this.options.hasOwnProperty(key) ){
                    this.options[key] = opt[key];
                }
            })
        }
        public async writeFile(loc?:string,options?:StaticOptions){
            loc = './'+(loc || this.url.params.path || this.url.pathname);
            let location = path.resolve(this.dirname, loc);
            if(options){
                this.configure(options);
            }
            if(fs.existsSync(location)){
                let stats = fs.statSync(location);
                if(stats.isDirectory()){
                    return this.writeFile(path.join(loc,this.options.indexFile));
                }else
                if(stats.isFile()){
                    return new Promise((accept,reject)=>{
                        fs.readFile(location, (err, data:Buffer)=> {
                            if(err){ reject(err) }
                            let defaultType = this.options.defaultType;
                            let contentType = Mime.default.lookup(location, defaultType);
                            let charSet = Mime.default.charset(contentType, 'utf-8');
                            if (charSet){
                                contentType += '; charset=' + charSet;                
                            }
                            this.response.setHeader('content-length', String(data.length));
                            this.response.setHeader('content-type', contentType);
                            this.response.write(data);
                            this.response.end();
                            return accept(true);
                        });
                    })
                }else{
                    return false;
                }
            }else{
                return false;
            }
        }
    }
}