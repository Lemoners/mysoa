const db = require('../db.js');
const Sequelize = require('sequelize');
const generateId = (name) => {
    return require('../config.js').generateId(name);
}


// except name, other remain untouched
module.exports = db.defineModel('Record', {
    id: { type: Sequelize.STRING(100), primaryKey: true },
    country: Sequelize.STRING(50),
    province: Sequelize.STRING(50),
    updateTime: Sequelize.STRING(30),
    confirmed: Sequelize.INTEGER,
    deaths: Sequelize.INTEGER,
    recovered: Sequelize.INTEGER,
}, {
    hooks: {
            beforeValidate: function (obj) {
                if (obj.isNewRecord) {
                    if (!obj.id) {
                        obj.id = generateId(obj.country + obj.province + obj.updateTime);
                    }
                }
            }
        }
});