const db = require('../db.js');
const Sequelize = require('sequelize');
const generateId = (name) => {
    return require('../config.js').generateId(name);
}


// except name, other remain untouched
module.exports = db.defineModel('Rumor', {
    id: { type: Sequelize.STRING(100), primaryKey: true },
    crawlTime: Sequelize.STRING(50),
    title: Sequelize.STRING(100),
    mainSummary: Sequelize.STRING(100),
    body: Sequelize.STRING(500),
}, {
    hooks: {
            beforeValidate: function (obj) {
                if (obj.isNewRecord) {
                    if (!obj.id) {
                        obj.id = generateId(obj.title + obj.crwalTime);
                    }
                }
            }
        }
});