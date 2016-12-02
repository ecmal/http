import {Path} from 'http/router/router';
import {Route} from "http/router/router";


class Resource {
    constructor(...args){
        console.info(this.constructor.name,...args)
    }
}

@Path('/pathA')
class ResourceA extends Resource{
    private params:any;
    get(numeric){
        console.log('in ResourceA arguments are ' , arguments);
        console.log('params in ResourceA are',this.params);
        return new Promise((resolve,reject)=>{
            console.log('in ResourceA GET method ');

            resolve('ResourceA result');
        });
    }
}
@Path('/pathB/:numeric(\\d+)')
class ResourceB extends Resource{
    private params:any;
    get(numeric){
        console.log('in ResourceB arguments are ' , arguments);
        console.log('params in ResourceB are',this.params);
        return new Promise((resolve,reject)=>{
             resolve('ResourceB result');
        });
    }
}

@Path('/pathC/(.*)')
class ResourceC extends Resource{
    private params:any;
    get (name){
        console.log('in ResourceC arguments are ' , arguments);
        console.log('params in ResourceC are',this.params);
        return new Promise((resolve,reject)=>{
            console.log('in ResourceC GET method ');
            resolve('ResourceC result');
        });
    }
}


@Path('/pathD/:required/:optional?')
class ResourceD extends Resource{
    private params:any;
    get(required,optional?){
        console.log('in ResourceD arguments are ' , arguments);
        console.log('params in ResourceD are',this.params);
        return new Promise((resolve,reject)=>{
            console.log('in ResourceD GET method ');
            resolve('ResourceD result');
        });
    }
}




@Path('/pathE/:numeric(\\d+)/:foo+',{
    delimiter:'#',
    end:false
})
class ResourceE extends Resource{
    private params:any;

    get(numeric,foo,kii){
        console.log('in ResourceE arguments are ' , arguments);
        console.log('params in ResourceE are',this.params);
        return new Promise((resolve,reject)=>{
            console.log('in ResourceE GET method ');
            resolve('ResourceE result');
        });
    }
}

export class Test{
    constructor (){
        let options = {
            "protocol" : "http:",
            "hostname" : "localhost",
            "host"     : "localhost:3000",
            "port"     : "3000",
            "pathname" : "/pathA",
            "search"   : "?foo=bar&noo=moo",
            "hash"     : "hasd5a4sd6as4d",
            "method"   : "GET",
        };
        Route.route("/pathA",options).then(
            (result)=>console.log(`RESULT FOR /pathA  IS ${JSON.stringify(result)}`),
            (error)=>console.log('ERROR  FOR /pathA IS ',error)
        );
        Route.route('/pathB/4521/',options).then((result)=>console.log(`RESULT FOR /pathB  IS ${JSON.stringify(result)}`),(error)=>console.log('ERROR  FOR /pathB IS ',error));
        Route.route('/pathC/541/some_path/',options).then((result)=>console.log(`RESULT FOR /pathC  IS ${JSON.stringify(result)}`),(error)=>console.log('ERROR  FOR /pathC IS ',error));
        Route.route('/PathD/1asd/24',options).then((result)=>console.log(`RESULT FOR /pathD  IS ${JSON.stringify(result)}`),(error)=>console.log('ERROR  FOR /pathD IS ',error));
        Route.route('/PathE/1/foo/foooo/45#last',options).then((result)=>console.log(`RESULT FOR /pathE  IS ${JSON.stringify(result)}`),(error)=>console.log('ERROR  FOR /pathE IS ',error));
    }
}
export default new Test();