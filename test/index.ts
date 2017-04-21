import {HttpServer} from "@ecmal/http/index";
import {Path,Get} from "@ecmal/http/decors";
import {Json,JsonTrait} from "@ecmal/http/traits/json";
import {Static} from "@ecmal/http/traits/static";
import {View} from "@ecmal/http/traits/view";
import {Resource} from "@ecmal/http/resource";
import * as path from '@ecmal/node/path';


@Path('/hello')
class HelloResource extends Json(Resource){

    @Get get(){
        return this.setBody({
            hello:"World"
        })
    }
}

@Path('/hello/ejs')
class EJSResource extends View(Resource){
    constructor(){
        super();
        this.configure({
            dirname:'./test/views',
        });
    }
    @Get get(){
        return this.render('index',{
            name:'EJS'
        });
    }
}


@Path('/')
@Path('/:file(*)')
class PublicResource extends Static(Resource){
    constructor(){
        super();
        this.configure({
            dirname:'./test/static',
        });
    }
    @Get get(){
        return this.serve();
    }
}

let s:HttpServer = new HttpServer();
console.info("server started at localhost:8000");
s.listen(8000);
