
import {HttpServer} from "@ecmal/http/index";
import {Route,route,GET} from "@ecmal/http/decors";
import {Json,JsonTrait} from "@ecmal/http/traits/json";
import {Static,Options} from "@ecmal/http/traits/static";
import {View,Options as Template} from "@ecmal/http/traits/view";
import {Resource} from "@ecmal/http/resource";
import {param} from "@ecmal/http/decors";
import {query} from "@ecmal/http/decors";


@Route('/hello')
@Route('/world/:param')
class HelloResource extends Json(Resource){

    @param('param')
    private name:string;

    @query('q')
    private q:string;

    @GET
    get(@param('param') name, @query('q') q:number){
        console.info(name,q,this.name,this.q);
        return this.writeJson({
            hello   : "World",
            url     : this.url,
            headers : this.request.headers,
        })
    }
    
    @route('hello')
    getHello(@param('param') name, @query('q') q:number){
        console.info(name,q,this.name,this.q);
        return this.writeJson({
            hello   : "World",
            url     : this.url,
            headers : this.request.headers,
        })
    }
}

@Route('/hello/ejs')
@Template({
    dirname:'./test/views'
})
class EJSResource extends View(Resource){
    @GET
    get(){
        return this.render('index',{
            name : 'EJS'
        });
    }
}


@Route('*')
@Options({
    dirname:'./test/static'
})
class PublicResource extends Static(Resource){
    @GET get(){
        return this.writeFile();
    }
}

export const server:HttpServer = new HttpServer();
server.listen(8000);
