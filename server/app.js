const Koa = require('koa');
const app = new Koa();

const controller = require('./controller');
const restify = require('./rest').restify;
const bodyparser = require('koa-bodyparser');
const model = require('./db/model.js');
const serve = require('koa-static');
const historyApiFallback = require('koa-history-api-fallback');


const logger = require('./logger.js').logger;


app.use(async (ctx, next) => {
	// log url
	console.log(`Process ${ctx.request.method} ${ctx.request.url}...`);
	// log date
	const start = new Date().toLocaleTimeString();

	const start_time = new Date().getTime();

	console.log(`Process at ${start}`);
	await next();

	const end_time = new Date().getTime();
	console.log("Consumption ", (end_time - start_time) / 1000 , `s for ${ctx.request.url}`);
});

app.use(logger);

// for post
app.use(bodyparser());

// restify
app.use(restify());

// controller
app.use(controller());

app.use(historyApiFallback());

// for static files
app.use(serve(__dirname + "/dist"));

// modules
model.loadModels();

app.listen(8889);
console.log('Start Koa at 8889...');
