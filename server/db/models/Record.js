const db = require('../db.js');
const Sequelize = require('sequelize');
const generateId = (name) => {
    return require('../config.js').generateId(name);
}


// except name, other remain untouched
module.exports = db.defineModel('Record', {
    id: { type: Sequelize.STRING(100), primaryKey: true },
    name: Sequelize.STRING(100),
    updateTime: Sequelize.STRING(100),
    currentConfirmedCount: Sequelize.INTEGER,
    suspectedCount: Sequelize.INTEGER,
    curedCount: Sequelize.INTEGER,
    deadCount: Sequelize.INTEGER
}, {
    hooks: {
            beforeValidate: function (obj) {
                if (obj.isNewRecord) {
                    if (!obj.id) {
                        obj.id = generateId(obj.name + obj.updateTime);
                    }
                }
            }
        }
});