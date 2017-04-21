import {Buffer} from "@ecmal/node/buffer";
import {Resource} from "../resource";

import {Views,Renderer} from "../engines/views";
import * as path from '@ecmal/node/path';
import * as FS from "@ecmal/node/fs";

export interface ViewOptions {
    dirname     ?:string;
    root        ?:string;
    engine      ?:Renderer;
}

export interface ViewTrait extends Resource {
    render(filename:string,body?:any):Promise<any>;
    configure(options:ViewOptions):void;
}
export function View<T extends Constructor<Resource>>(Base: T):Constructor<ViewTrait>{
    return class ViewResource extends Base implements ViewTrait {
        protected options:ViewOptions = {
            dirname     : 'views',
            root        : process.cwd(),
            engine      : Views.engine()
        };
        public configure(options:ViewOptions){
            let opt = options || {};
            Object.keys(opt).forEach(key=>{
                if( this.options.hasOwnProperty(key) ){
                    this.options[key] = opt[key];
                }
            })
        }
        async render(filename:string,body = {}){
            let dir = path.join(this.options.root,this.options.dirname);
            let location = path.join(dir,filename);
            let ext = path.extname(location);
            if( !ext || ext == '' ){
                location+='.ejs';
            }
            return new Promise((accept,reject)=>{
                FS.readFile(location, (err, buffer:Buffer)=> {
                    if( err ) return reject(err);
                    let {engine} = this.options;
                    Object.defineProperties(body,{
                        filename:{value:location},
                        scope   :{value:this},
                    });
                    let contentType = 'text/html; charset=utf-8',
                        template;
                    try {
                        template = engine.render(body,String(buffer));
                    }catch (e){
                        contentType = 'text/plain; charset=utf-8';
                        template = String(e);
                    }
                    let data = new Buffer(template,'utf8');
                    this.response.setHeader('content-length', String(data.length));
                    this.response.setHeader('content-type', contentType);
                    this.response.write(data);
                    this.response.end();
                    accept(template);
                });
            });
        }
    }
}