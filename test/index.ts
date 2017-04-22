import {HttpServer} from "@ecmal/http/index";
import {Path,GET} from "@ecmal/http/decors";
import {Json,JsonTrait} from "@ecmal/http/traits/json";
import {Static} from "@ecmal/http/traits/static";
import {View} from "@ecmal/http/traits/view";
import {Resource} from "@ecmal/http/resource";
import {PathParam} from "@ecmal/http/decors";
import {QueryParam} from "@ecmal/http/decors";


@Path('/hello')
@Path('/world/:param')
class HelloResource extends Json(Resource){

    @PathParam('param')
    private name:string;

    @QueryParam('q')
    private q:string;

    @GET
    get(@PathParam('param') name,@QueryParam('q') q){
        console.info(name,q,this.name,this.q)
        return this.setBody({
            hello   : "World",
            url     : this.url,
            params  : this.params,
            headers : this.request.headers,
        })
    }
}

@Path('/hello/ejs')
class EJSResource extends View(Resource){
    constructor(){
        super();
        this.configure({
            dirname : './http/test/views',
        });
    }
    @GET
    get(){
        return this.render('index',{
            name : 'EJS'
        });
    }
}

@Path('/')
@Path('/:file(*)')
class PublicResource extends Static(Resource){
    constructor(){
        super();
        this.configure({
            dirname:'./http/test/static',
        });
    }
    @GET get(){
        return this.serve();
    }
}

let s:HttpServer = new HttpServer();
console.info("server started at localhost:8000");
s.listen(8000);
