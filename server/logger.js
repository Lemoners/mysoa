const path = require('path');
const log4 = require('koa-log4');


log4.configure({
    appenders: {
        access: {
            type: 'dateFile',
            pattern: '-yyyy-MM-dd.log',
            filename: path.resolve(__dirname, 'log/access.log')
        },
        out: {
            type: 'console'
        }
    },
    categories: {
        default: { appenders: ['out'], level: 'info' },
        access: { appenders: ['access'], level: 'info'}
    }
});

module.exports.logger = log4.koaLogger(log4.getLogger('access'));