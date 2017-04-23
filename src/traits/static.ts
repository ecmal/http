import {Buffer} from "@ecmal/node/buffer";
import {Resource} from "../resource";
import * as fs from '@ecmal/node/fs';
import * as path from '@ecmal/node/path';
import {Mime} from "../mime";
import {Mirror} from "@ecmal/runtime/reflect";
import {Meta} from '@ecmal/runtime/decorators/metadata'

const OPTIONS = Symbol();
export interface StaticTrait extends Resource {
    writeFile(location?:string,code?:number):Promise<boolean>;
}
export interface StaticOptions extends Object{
    dirname      :string;
    defaultType ?:string;
    indexFile   ?:string;
}
export function Static<T extends Constructor<Resource>>(Base: T):Constructor<StaticTrait>{
    return class StaticResource extends Base implements StaticTrait {

        public async writeFile(loc?:string,code:number = 200){
            let options:StaticOptions = {
                dirname     : './',
                defaultType : 'application/octet-stream',
                indexFile   : 'index.html'
            };
            let metadata:StaticOptions = Mirror.get(this.constructor).getMetadata(OPTIONS) || {};
            Object.keys(metadata).forEach(key=>{
                if(options.hasOwnProperty(key)){
                    options[key] = metadata[key];
                }
            });

            let dirname = path.join(process.cwd(),options.dirname);
            let location = loc ? path.resolve(loc) :  (path.resolve(dirname,path.join('./',(this.url.params.path || this.url.pathname))));
            if(fs.existsSync(location)){
                let stats = fs.statSync(location);
                if(stats.isDirectory()){
                    return this.writeFile(path.join(location,options.indexFile));
                }else
                if(stats.isFile()){
                    return new Promise((accept,reject)=>{
                        fs.readFile(location, (err, data:Buffer)=> {
                            if(err){ reject(err) }
                            let defaultType = options.defaultType;
                            let contentType = Mime.default.lookup(location, defaultType);
                            let charSet = Mime.default.charset(contentType, 'utf-8');
                            if (charSet){
                                contentType += '; charset=' + charSet;
                            }
                            this.write(data,code,{
                                'content-type':contentType
                            });
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
export function Options(options:StaticOptions){
    return Meta(OPTIONS,options);
}

