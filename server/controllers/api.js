const APIError = require('../rest').APIError;
const model = require('../db/model.js');
const sequelize = require('../db/db.js').sequelize;
const province_code = require('../assets/province.js').province;

module.exports = [
	{
		method: 'GET',
		path: '/api/record/area/:name',
		func: async (ctx, next) => {
			let name = ctx.params.name || 'NONE';
			let records = await model.Record.findAll({
				where: {
					name: name
				}
			});
			// console.log(records);
			if (records.length === 0) {
				throw new APIError('404', 'Requested area not found');
			} else {
				ctx.rest(records);
			}
		}
	},{
		method: 'GET',
		path: '/api/record/latest',
		func: async (ctx, next) => {
			let records = await sequelize.query('select name, updateTime, currentConfirmedCount, suspectedCount, curedCount, deadCount from Record, (select name as tn, max(updateTime) as tm from Record group by name) as t where Record.name = t.tn and Record.updateTime = t.tm order by name;');
			if (records[0].length === 0) {
				throw new APIError('404', 'Latest data is empty');
			} else {
				ctx.rest(records[0]);
			}
		}
	},{
		method: 'GET',
		path: '/api/record/all',
		func: async (ctx, next) => {
			let records = await model.Record.findAll({
				order: [
					['updateTime', 'DESC']
				]
			});
			// console.log(records);
			if (records.length === 0) {
				throw new APIError('404', 'Requested record not found');
			} else {
				ctx.rest(records);
			}
		}
	},{
		method: 'GET',
		path: '/api/record/time/:time',
		func: async (ctx, next) => {
			let time = ctx.params.time || 'NONE';
			let records = await model.Record.findAll({
				where: {
					updateTime: time
				},
				order: [
					['name']
				]
			});
			// console.log(records);
			if (records.length === 0) {
				throw new APIError('404', 'Requested time not found');
			} else {
				ctx.rest(records);
			}
		}
	},{
		method: 'GET',
		path: '/api/card/:provinceCode',
		func: async (ctx, next) => {
			let province = ctx.params.provinceCode || 'NONE';
			let indexs = await model.BaiduIndex.findAll({
				where: {
					province: province
				},
				order: [
					['date'],
				]
			});

			if (indexs.length === 0) {
				throw new APIError('404', 'Cannot find province card data');
			} else {
				ctx.rest(indexs);
			}
		}
	},{
		method: 'GET',
		path: '/api/news/all',
		func: async (ctx, next) => {
			let news = await model.News.findAll({
				order: [
					['pubDate', 'DESC'],
				]
			});
			if (news.length === 0) {
				throw new APIError('404', 'Cannot find any news');
			} else {
				ctx.rest(news);
			}
		}
	},{
		method: 'GET',
		path: '/api/rumor/all',
		func: async (ctx, next) => {
			let rumors = await model.Rumor.findAll({
				order: [
					['crawlTime', 'DESC'],
				]
			});
			if (rumors.length === 0) {
				throw new APIError('404', 'Cannot find any rumors');
			} else {
				ctx.rest(rumors);
			}
		}
	}
];
