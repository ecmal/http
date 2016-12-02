import {EJS} from "./compiler";



let template = new EJS(`<html>
    <head>
        <title><%=title%></title>
    </head>
    <body>
        <div><%=title%></div>
        <div><%=content%></div>
    </body>
</html>`);

console.info(template.render({
    title:'Gago',
    content:'Gago Content',
}));

console.info(template.render({
    title:'Mago',
    content:'Mago Content',
}));

console.info(template.render({
    title:'Mugo',
    content:'Mugo Content',
}));
