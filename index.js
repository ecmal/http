require('./out/runtime/index');
System.import('http/test/server')
    .then(function(e){console.info(e)})
    .catch(function(){console.error(e.stack)})
;