/**
 * Created by Grigor on 4/26/17.
 */

import {HttpServer} from "@ecmal/http/index";
import {Route,route,GET,POST,PUT,DELETE,OPTIONS} from "@ecmal/http/decors";
import {Json} from "@ecmal/http/traits/json";
import {Gzip} from "@ecmal/http/traits/gzip";
import {Static,Options} from "@ecmal/http/traits/static";
import {View,Options as Template} from "@ecmal/http/traits/view";
import {Resource} from "@ecmal/http/resource";
import {param} from "@ecmal/http/decors";
import {query} from "@ecmal/http/decors";


@Route('/resource')
@Route('/resource_with_param/:param')
class HelloResource extends Json(Resource){
    @param('param')
    private name:string;

    @query('q')
    private q:string;

    @GET
    get(@param('param') name, @query('q') q:number){
        return this.writeJson({
            param   : name,
            param1  : this.name,
            query   : q,
            query1  : this.q,
            url     : this.url,
            headers : this.request.headers,
        })
    }

    @GET
    @route('nested')
    getNested(@param('param') name, @query('q') q:number){
        return this.writeJson({
            param   : name,
            param1  : this.name,
            query   : q,
            query1  : this.q,
            url     : this.url,
            headers : this.request.headers,
        })
    }


    @POST
    post(@param('param') name, @query('q') q:number){
        return this.writeJson({
            param   : name,
            param1  : this.name,
            query   : q,
            query1  : this.q,
            url     : this.url,
            headers : this.request.headers,
        })
    }

    @POST
    @route('nested')
    postNested(@param('param') name, @query('q') q:number){
        return this.writeJson({
            param   : name,
            param1  : this.name,
            query   : q,
            query1  : this.q,
            url     : this.url,
            headers : this.request.headers,
        })
    }

    @PUT
    put(@param('param') name, @query('q') q:number){
        return this.writeJson({
            param   : name,
            param1  : this.name,
            query   : q,
            query1  : this.q,
            url     : this.url,
            headers : this.request.headers,
        })
    }

    @PUT
    @route('nested')
    putNested(@param('param') name, @query('q') q:number){
        return this.writeJson({
            param   : name,
            param1  : this.name,
            query   : q,
            query1  : this.q,
            url     : this.url,
            headers : this.request.headers,
        })
    }

    @DELETE
    delete(@param('param') name, @query('q') q:number){
        return this.writeJson({
            param   : name,
            param1  : this.name,
            query   : q,
            query1  : this.q,
            url     : this.url,
            headers : this.request.headers,
        })
    }

    @DELETE
    @route('nested')
    deleteNested(@param('param') name, @query('q') q:number){
        return this.writeJson({
            param   : name,
            param1  : this.name,
            query   : q,
            query1  : this.q,
            url     : this.url,
            headers : this.request.headers,
        })
    }
}

@Route('/view/ejs')
@Template({
    dirname:'./test/tests/resources/views'
})
class EJSResource extends View(Resource){
    @GET
    get(){
        return this.render('index',{name : 'EJS'});
    }
}


@Route('*')
@Options({
    dirname : './test/tests/resources/static',
    cache   : true
})
class PublicResource extends Static(Resource){
    @GET get(){
        return this.writeFile();
    }
}

export const server:HttpServer = new HttpServer();
