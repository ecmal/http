import {HttpServer} from "@ecmal/http/index";
import {Path,Get} from "@ecmal/http/decors";
import {Json,JsonTrait} from "@ecmal/http/traits/json";
import {Static} from "@ecmal/http/traits/static";
import {Resource} from "@ecmal/http/resource";
import * as path from '@ecmal/node/path';

@Path('/public/:file(*)')
class StaticResource extends Static(Resource){
    @Get
    get(){
        this.setBody({dirname:'./static'})
    }
}

@Path('/hello')
class HelloResource extends Json(Resource){

    @Get get(){
        this.setBody({
            hello:"World"
        })
    }
}

let s:HttpServer = new HttpServer();
console.info("server started localhost:8000");
s.listen(8000);
