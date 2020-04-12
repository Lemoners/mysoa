const db = require('../db.js');
const Sequelize = require('sequelize');
const generateId = (name) => {
    return require('../config.js').generateId(name);
}

// except name, other remain untouched
module.exports = db.defineModel('BaiduIndex', {
    id: { type: Sequelize.STRING(100), primaryKey: true },
    province: Sequelize.STRING(20),
    date: Sequelize.STRING(20),
    type: Sequelize.STRING(10),
    index: Sequelize.INTEGER
}, {
    hooks: {
            beforeValidate: function (obj) {
                if (obj.isNewRecord) {
                    if (!obj.id) {
                        obj.id = generateId(obj.province + obj.date + obj.type);
                    }
                }
            }
        }
});