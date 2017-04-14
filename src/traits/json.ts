import {Buffer} from "@ecmal/node/buffer";
import {Resource} from "../resource";


export interface JsonTrait extends Resource {
    getBody():Promise<any>;
    setBody(body:any):Promise<boolean>;
}
export function Json<T extends Constructor<Resource>>(Base: T):Constructor<JsonTrait>{
    return class JsonResource extends Base implements JsonTrait {
        async getBody(){
            return new Promise((accept,reject)=>{
                try{
                    let data = new Buffer(0);
                    this.request.on('data',chunk=>{
                        try{
                            data = Buffer.concat([data,chunk],data.length+chunk.length);
                        }catch(ex){
                            reject(ex);
                        }
                    })
                    this.request.on('end',()=>{
                        try{
                            accept(JSON.parse(data.toString('utf8')))
                        }catch(ex){
                            reject(ex);
                        }
                    })
                    this.request.on('error',e=>reject(e));
                }catch(ex){
                    reject(ex);
                }
            })            
        }
        async setBody(body){
            let data = new Buffer(JSON.stringify(body),'utf8');
            this.response.writeHead(200,'OK',{
                'Access-Control-Allow-Origin':'*',
                'content-type':"application/json",
                "content-length":data.length
            });
            this.response.end(data);
            return true;
        }
    }
}