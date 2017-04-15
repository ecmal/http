import {Buffer} from "@ecmal/node/buffer";
import {Resource} from "../resource";
import * as fs from '@ecmal/node/fs';
import * as path from '@ecmal/node/path';
import {Mime} from "../mime";

export interface StaticTrait extends Resource {
    setBody(body:any);
}
export function Static<T extends Constructor<Resource>>(Base: T):Constructor<StaticTrait>{
    return class StaticResource extends Base implements StaticTrait {
        async setBody(options:{dirname:string}){
            if( this.params.file ){
                let location = path.join(process.cwd(),options.dirname);
                location = path.join(location, this.params.file);

                fs.readFile(location, (err, data:Buffer)=> {
                    if ( !err ) {
                        let defaultType = 'application/octet-stream',
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
                    }else{
                        //TODO next page not found
                        let data = new Buffer("Not Found");
                        this.response.statusCode = 404;
                        this.response.write(data);
                        this.response.end();
                    }
                });
            }

        }
    }
}