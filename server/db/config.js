const uuid = require('uuid');

var config = {
    dialect: 'mysql',
    database: 'records',
    username: 'lemon',
    password: 'Passwd17',
    host: 'localhost',
    port: 3306,
};

var remoteconfig = {
    dialect: 'mysql',
    database: 'records',
    username: 'root',
    password: 'Passwd17',
    host: '182.92.86.236',
    port: 3306,
};

var redisconfig = {
    port: 6379,
    host: '182.92.86.236',
    family: 4,
    password: "Passwd17",
    db: 0,
};

module.exports.generateId = (name) => {
        let myuuid = '42eaed3b-2a15-4707-a1ac-b16fb7569204';
        return uuid.v5(name, myuuid);
}
module.exports.config = config;
module.exports.remoteconfig = remoteconfig;
module.exports.redisconfig = redisconfig;