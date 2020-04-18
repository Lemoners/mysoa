const db = require('./db.js');
const fs = require('mz/fs');
// mz/fs is a Promise version of fs

function loadModels(dir) {
    let m_dir = dir || 'models';
    let files = fs.readdirSync(__dirname + '/' + m_dir).filter((f) => {
        return f.endsWith('.js');
    });
    for (let f of files) {
        console.log(`Import model from file ${f}...`);
        let mname = f.substring(0, f.length - 3);
        module.exports[mname] = require(__dirname + '/' + m_dir + '/' + f);
    }
}

module.exports.sync = () => {
    db.sync();
};
module.exports.forceSync = () => {
    db.forceSync();
};
module.exports.loadModels = loadModels;





