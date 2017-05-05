import {Buffer} from "@ecmal/node/buffer";
import {Resource} from "../resource";

import {Views,Renderer} from "../engines/views";
import * as path from '@ecmal/node/path';
import * as FS from "@ecmal/node/fs";
import {Mirror} from "@ecmal/runtime/reflect";
import {Meta} from "@ecmal/runtime/decorators/metadata";

const OPTIONS = Symbol();
export interface ViewOptions {
    dirname     ?:string;
    root        ?:string;
    engine      ?:Renderer;
}

export interface ViewTrait extends Resource {
    render(filename:string,body?:any,code?:number):Promise<any>;
}
export function View<T extends Constructor<Resource>>(Base: T):T&Constructor<ViewTrait>{
    return class ViewResource extends Base implements ViewTrait {
        async render(filename:string,body = {},code:number = 200){
            let options:ViewOptions = {
                dirname     : 'views',
                root        : process.cwd(),
                engine      : Views.engine()
            };
            let metadata:ViewOptions = Mirror.get(this.constructor).getMetadata(OPTIONS) || {};
            Object.keys(metadata).forEach(key=>{
                if(options.hasOwnProperty(key)){
                    options[key] = metadata[key];
                }
            });
            let dir = path.join(options.root,options.dirname);
            let location = path.join(dir,filename);
            let ext = path.extname(location);
            if( !ext || ext == '' ){
                location+='.ejs';
            }
            return new Promise((accept,reject)=>{
                FS.readFile(location, (err, buffer:Buffer)=> {
                    if( err ) return reject(err);
                    let {engine} = options;
                    Object.defineProperties(body,{
                        filename:{value:location},
                        scope   :{value:this},
                    });
                    try {
                        accept(this.write(engine.render(body,String(buffer)),code,{
                            'content-type':'text/html; charset=utf-8'
                        }));
                    }catch (e){
                        accept(this.write(e,500));
                    }
                });
            });
        }
    }
}
export function Options(options:ViewOptions){
    return Meta(OPTIONS,options);
}