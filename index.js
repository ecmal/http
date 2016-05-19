require('./out/runtime/package');
system.import('http/server-test')
    .then(function(e){console.info(e)})
    .catch(function(){console.error(e.stack)})
;