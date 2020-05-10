const fs = require('fs');

function addMapping(router, mapping) {
    console.log("mapping", mapping);
    for (var cont of mapping) {
        switch(cont.method) {
            case 'GET':
                router.get(cont.path, cont.func);
                break;
            case 'POST':
                router.post(cont.path, cont.func);
                break;
            default:
                console.log(`Invalid URL ${cont.method}`);
                break;
        }
    }
}

function addControllers(router, dir) {
    //default dir = 'controllers'
    var files = fs.readdirSync(__dirname + '/' + dir);
    var js_files = files.filter((f) => {
        return f.endsWith('.js');
    });

    for (var f of js_files) {
        console.log(`Process controllers ${f}...`);
        let mapping = require(__dirname + '/' + dir + '/' + f);
        addMapping(router, mapping);
    }
}

module.exports = function(dir) {
    let c_dir = dir || 'controllers',
    router = require('koa-router')();
    addControllers(router, c_dir);
    return router.routes();
}
