import {Buffer} from "@ecmal/node/buffer";
import {Resource} from "../resource";
import * as fs from '@ecmal/node/fs';
import * as path from '@ecmal/node/path';
import {Mime} from "../mime";

export interface StaticTrait extends Resource {
    serve(options?:StaticOptions):Promise<boolean>;
    configure(options:StaticOptions):void;
    sendFile(location:string):Promise<boolean>;
}
export interface StaticOptions extends Object{
    dirname      :string;
    defaultType ?:string;
    indexFile   ?:string;
}
export function Static<T extends Constructor<Resource>>(Base: T):Constructor<StaticTrait>{
    return class StaticResource extends Base implements StaticTrait {
        protected options:StaticOptions = {
            dirname     :void 0,
            defaultType : 'application/octet-stream',
            indexFile   : 'index.html'
        };
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
        async serve(options?:StaticOptions){
            try {
                if( options ){
                    this.configure(options);
                }
                if( !this.options.dirname ){
                    throw new Error(`dirname is not defined. use configure({dirname:'some/dir/name'}) for defining static directory`);
                }
                return new Promise(async accept=>{
                    if( !this.params.file && this.url.pathname !='/' ){
                        return accept(false);
                    }
                    let url:string  = this.params.file || this.url.pathname;
                    let location    = path.join(this.dirname, url);
                    accept(await this.sendFile(location));
                });
            }catch (err){
                let data = new Buffer(JSON.stringify({
                    error   : err.message,
                    code    : 500,
                    stack   : err.stack.split("\n")
                }),'utf8');
                this.response.setHeader('content-length', String(data.length));
                this.response.setHeader('content-type', "application/json");
                this.response.write(data);
                this.response.end();
                return Promise.reject(false);
            }
        }
        public async sendFile(location){
            return new Promise(accept=>{
                fs.stat(location, (e, stats) =>{
                    if(e){
                        return accept(false);
                    }
                    fs.readFile(location, (err, data:Buffer)=> {
                        if ( !err && stats.isFile()) {
                            let defaultType = this.options.defaultType,
                                contentType = Mime.default.lookup(location, defaultType),
                                charSet;

                            if (contentType) {
                                charSet =Mime.default.charset(contentType, 'utf-8');
                                if (charSet) {
                                    contentType += '; charset=' + charSet;
                                }
                            }
                            this.response.setHeader('content-length', String(data.length));
                            this.response.setHeader('content-type', contentType);
                            this.response.write(data);
                            this.response.end();
                            return accept(true);
                        }
                        if( stats.isDirectory() ){
                            return this.sendFile(path.join(this.dirname,this.options.indexFile));
                        }
                        accept(false);
                    });
                });
            });

        };
    }
}