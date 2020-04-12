const Sequelize = require('sequelize');

const config = require('./config.js').config;

// console.warn("Using remote db");
// const config = require('./config.js').remoteconfig;

var sequelize = new Sequelize(config.database, config.username, config.password, {
        host: config.host,
        dialect: config.dialect,
        pool: {
            max: 5,
            min: 0,
            idle: 10000,
        },
        logging: false
    });


function defineModel(name, attrs, opt) {
    opt = opt || {};
    for (let key in attrs) {
        let value = attrs[key];
        if (typeof value === 'object' && value['type']) {
            attrs[key].allowNull = true;
        } else {
            attrs[key].allowNull = false;
        }
    }
    opt.tableName = name;
    opt.timestamps = false;
    opt.freezeTableName = true;
    return sequelize.define(name, attrs, opt);
}

module.exports = {
    defineModel: defineModel,
    sequelize: sequelize,
    sync: () => {
        // Warning, this will delete original table
        // console.warn("SYNC WILL DELETE ORIGINAL TABLE NOW: at db.js")
        // sequelize.sync({ force: true });

        sequelize.sync();
    },
}
