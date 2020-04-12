const db = require('../db.js');
const Sequelize = require('sequelize');
const generateId = (name) => {
    return require('../config.js').generateId(name);
}


// except name, other remain untouched
module.exports = db.defineModel('News', {
    id: { type: Sequelize.STRING(100), primaryKey: true },
    pubDate: Sequelize.STRING(100),
    sourceUrl: Sequelize.STRING(250),
    title: Sequelize.STRING(200),
    summary: Sequelize.STRING(500)
}, {
    hooks: {
            beforeValidate: function (obj) {
                if (obj.isNewRecord) {
                    if (!obj.id) {
                        obj.id = generateId(obj.title);
                    }
                }
            }
        }
});