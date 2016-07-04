<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Http Library Test</title>
</head>
<script>
    //var ws = new WebSocket('ws://localhost:5890/ws');
    var ws = new WebSocket('ws://localhost:3000/agent/grish');
    ws.onopen = function(ev){
        var data = [];
        for(var i=0;i<10000;i++){
            data.push(1);
        }
        var json = JSON.stringify(data);
        ws.send(json);
        ws.send(json);

        setInterval(function () {
            ws.send(json);
        },1000);

        //ws.send(JSON.stringify([]));
        //ws.send(JSON.stringify([]));
        //ws.send(JSON.stringify([]));
        //ws.send(JSON.stringify([]));
    };
    ws.onmessage = function(ev){
        if(ev.data instanceof Blob){
            console.info(ev.timeStamp,ev.target.protocol,"blob",ev.data.size);
        }else{
            console.info(ev.timeStamp,ev.target.protocol,"text",JSON.parse(ev.data));
        }
    };
    ws.onclose = function(ev){
        console.info(ev)
    };
    ws.onerror = function(ev){
        console.error(ev)
    };
</script>
</html>