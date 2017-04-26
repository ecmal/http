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
    cache       ?:boolean
    indexFile   ?:string;
}
export function Static<T extends Constructor<Resource>>(Base: T):Constructor<StaticTrait>{
    return class StaticResource extends Base implements StaticTrait {

        private setCacheControl(stats,headers){
            let reqCacheControl = this.request.headers['cache-control'],
                reqIfModifiedSince = this.request.headers['if-modified-since'],

                lasModifiedTime = stats.mtime,
                isCacheEnabled = (reqCacheControl !='no-cache') ;
            if(isCacheEnabled){
                headers['Cache-Control']    = 'public, max-age=86400';
                headers['Expires']          = new Date(new Date().getTime()+86400000).toUTCString();
                headers['Last-Modified']   = lasModifiedTime.toUTCString();
                if(reqIfModifiedSince && lasModifiedTime.getTime() <= new Date(reqIfModifiedSince).getTime()) {
                    return true;
                }
            }else{
                headers['Cache-Control'] = 'no-cache, no-store, must-revalidate';
                return false;
            }
        }
        public async writeFile(loc?:string,code:number = 200){
            let options:StaticOptions = {
                dirname     : './',
                defaultType : 'application/octet-stream',
                indexFile   : 'index.html',
                cache       : false
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
                    let contentType = Mime.default.lookup(location, options.defaultType);
                    let charSet = Mime.default.charset(contentType, 'utf-8');
                    if (charSet){
                        contentType += '; charset=' + charSet;
                    }
                    let headers = {
                        'content-type': contentType
                    };
                    let isCached = options.cache ?  this.setCacheControl(stats,headers) : false;
                    if( isCached ){
                        this.response.writeHead(304,headers);
                        return this.response.end();
                    }
                    return this.write(fs.createReadStream(location),code,headers);
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

