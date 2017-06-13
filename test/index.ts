
import { HttpServer } from "@ecmal/http/index";
import { Route, route, GET, PUT } from "@ecmal/http/decors";
import { Json, JsonTrait } from "@ecmal/http/traits/json";
import { Static } from "@ecmal/http/traits/static";
import { View } from "@ecmal/http/traits/view";
import { Resource } from "@ecmal/http/resource";
import { param } from "@ecmal/http/decors";
import { query } from "@ecmal/http/decors";

import schema from './schema';

@Route('/v2/pet')
class PetResource extends Json(Resource) {
    @GET
    @route(':id')
    get() {
        return this.writeJson({
            "id": this.url.params.id,
            "category": {"id": 0,"name": "Home"},
            "name": "Doggie",
            "photoUrls": ["string"],
            "tags": [
                {"id": 0,"name": "dog"}
            ],
            "status": "available"
        });
    }
}

@Route('/v2/schema.json')
class SwaggerApiResource extends Json(Resource) {
    @GET
    get() {
        return this.writeJson(schema);
    }
}

@Route('/:path(*)')
class SwaggerUiResource extends Static(Resource) {
    constructor() {
        super();
        this.configure({ dirname: './test/swagger' });
    }
    @GET
    get() {
        return this.writeFile();
    }
}

export const server: HttpServer = new HttpServer();
