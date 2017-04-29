import {Buffer} from "@ecmal/node/buffer";
import {Resource} from "../resource";
import {HttpHeaders} from "../common";
import {Readable} from "@ecmal/node/stream";
import {createGzip} from "@ecmal/node/zlib";
import {Meta} from "@ecmal/runtime/decorators/metadata";
import {Mirror} from "@ecmal/runtime/reflect";
import {Mime} from "../mime";

export interface GzipTrait extends Resource {
   write(body:Buffer|string|any,code?:number,headers?:HttpHeaders):Promise<boolean>;
}
export function Gzip<T extends Constructor<Resource>>(Base: T):Constructor<GzipTrait>{
    return class GzipResource extends Base implements GzipTrait {
        async write(body:Buffer|Readable|string|any,code:number=200,headers:HttpHeaders={}){
            let options:GzipOptions = {
                enable     : true,
            };
            let metadata:GzipOptions = Mirror.get(this.constructor).getMetadata(OPTIONS) || {};
            if( typeof metadata.enable!=='undefined' ){
                options.enable = metadata.enable;
            }
            let encoding:string = (this.request.headers['accept-encoding'] || "").split(',').map(e=>e.trim());
            if( encoding.indexOf('gzip') < -1 ){
                return super.write(body,code,headers);
            }
            if( options.enable !== true ){
                return super.write(body,code,headers);
            }
            if (this.request.method === 'HEAD') {
                return super.write(body,code,headers);
            }
            let head = Object.keys(headers).reduce((h,k)=>(
                h[String(k).toLowerCase()] = headers[k], h
            ),{ "content-type" : void 0 });

            let type = head['content-type'];
            if( type == void 0 || !Mime.isCompressible(type) ){
                return super.write(body,code,headers);
            }

            headers['content-encoding'] = 'gzip';
            if(body instanceof Readable){
                return super.write(body.pipe(createGzip()),code,headers);
            }
            if( !Buffer.isBuffer(body)){
                body = new Buffer(String(body),'utf8');
            }
            let stream:any = new Readable();
            stream.push(body);
            stream.push(null);
            return super.write(stream.pipe(createGzip()),code,headers);

        }
    }
}
const OPTIONS = Symbol();
export interface GzipOptions{
    enable : boolean
}
export function Options(options:GzipOptions){
    return Meta(OPTIONS,options);
}