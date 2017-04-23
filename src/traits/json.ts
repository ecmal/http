import {Buffer} from "@ecmal/node/buffer";
import {Resource} from "../resource";
import {HttpHeaders} from "../common";


export interface JsonTrait extends Resource {
    readJson():Promise<any>;
    writeJson(body:any,code?:number,headers?:HttpHeaders):Promise<boolean>;
}
export function Json<T extends Constructor<Resource>>(Base: T):Constructor<JsonTrait>{
    return class JsonResource extends Base implements JsonTrait {
        async readJson(){
            let data = await this.read();
            if(data && data.length){
                return JSON.parse(data.toString());
            }else{
                return null;
            }
        }
        async writeJson(body:any,code:number=200,headers:HttpHeaders={}){
            return this.write(JSON.stringify(body),code,Object.assign(headers,{
                'content-type':"application/json"
            }))
        }
    }
}