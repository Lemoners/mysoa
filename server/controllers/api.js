const APIError = require('../rest').APIError;
const model = require('../db/model.js');
const sequelize = require('../db/db.js').sequelize;
const redis = require('../db/db.js').redis;
const province_code = require('../assets/province.js').province;
const province_en2chi = require('../assets/province_eng2chi.js');


function getLocalTime(nS) {
    let d=  new Date(parseInt(nS))
    let date = [d.getFullYear(),d.getMonth()+1, d.getDate()]

	for (let i in date) {
		if (date[i]<10) {
			date[i] = "0" + date[i];
		}
	}
	return (date[0] + '-' + date[1] + '-' + date[2]);
}

function getCurrentTime() {
	let date = (new Date().toLocaleDateString().split('/').reverse());

	for (let i in date) {
		if (date[i].length == 1) {
			date[i] = "0" + date[i];
		}
	}
	return (date[0] + '-' + date[2] + '-' + date[1]);
}


let methods = [
	{
		method: 'GET',
		path: '/api/record/country/name/:name',
		func: async (ctx, next) => {
			let name = ctx.params.name || 'NONE';
			let records = await model.Record.findAll({
				attributes: { exclude: ['id'] },
				where: {
					country: name
				}
			});
			// console.log(records);
			if (records.length === 0) {
				throw new APIError('404', 'Requested country not found');
			} else {
				ctx.rest(records);
			}
		}
	},{
		method: 'GET',
		path: '/api/record/latest',
		func: async (ctx, next) => {
			
			let key = 'rl' + getCurrentTime();
			let result = await redis.get(key);
			var records = {};

			if (result) {
				records = JSON.parse(result);
			} else {
				let coun_records = await sequelize.query('select country, updateTime, confirmed, deaths, recovered from Record, (select country as tc, max(updateTime) as tm from Record where province="" group by country) as t where Record.country = t.tc and Record.updateTime = t.tm order by country;');

				for (var i of coun_records[0]) {
					records[i.country] = {
						province: {},
						updateTime: i.updateTime,
						confirmed: i.confirmed,
						deaths: i.deaths,
						recovered: i.recovered
					}
				}
				
				let coun_prov_records = await sequelize.query('select country, province, updateTime, confirmed, deaths, recovered from Record, (select province as tp, max(updateTime) as tm from Record where province!="" group by province) as t where Record.province = tp and Record.updateTime = t.tm order by country;');

				for (var i of coun_prov_records[0]) {
					if (i.country in records) {
						records[i.country].confirmed += i.confirmed;
						records[i.country].deaths += i.deaths;
						records[i.country].recovered += i.recovered;
						records[i.country].province[i.province] = {
							confirmed: i.confirmed,
							deaths: i.deaths,
							recovered: i.recovered
						};
					} else {
						records[i.country] = {};
						records[i.country].confirmed = i.confirmed;
						records[i.country].deaths = i.deaths;
						records[i.country].recovered = i.recovered;
						records[i.country].province = {};
						records[i.country].province[i.province] = {
							confirmed: i.confirmed,
							deaths: i.deaths,
							recovered: i.recovered
						};
					}
				}

				result = JSON.stringify(records);
				let redresult = await redis.set(key, result);
				console.log("redis result", redresult);
			}
			
			if (Object.getOwnPropertyNames(records).length === 0) {
				throw new APIError('404', 'Latest data is empty');
			} else {
				ctx.rest(records);
			}
		}
	},{
		method: 'GET',
		path: '/api/record/country/all',
		func: async (ctx, next) => {
			// Record + Country + All
			// eg rca2020-04-25

			let rkey = "count";
			let rresult = (await redis.get(rkey)) | "0";
			rresult = (parseInt(rresult) + 1) + "";
			await redis.set(rkey, rresult);

			let key = 'rca' + getCurrentTime();
			let result = await redis.get(key);

			let records = {};

			if (result) {
				records = JSON.parse(result);
			} else {
				let coun_records = await sequelize.query('select country, updateTime ,sum(confirmed) as confirmed, sum(deaths) as deaths, sum(recovered) as recovered from `Record` where country != "United States" group by country, updateTime order by updateTime, country;')

				for (var i of coun_records[0]) {
					if (!(i.updateTime in records)) {
						records[i.updateTime] = {};
					}

					records[i.updateTime][i.country] = {
						confirmed: i.confirmed,
						deaths: i.deaths,
						recovered: i.recovered
					};
				}

				let us_records = await sequelize.query('select country, province, updateTime, confirmed, deaths, recovered from `Record` where country="United States" and province="" order by updateTime');
				for (var i of coun_records[0]) {
					if (!(i.updateTime in records)) {
						records[i.updateTime] = {};
					}

					records[i.updateTime][i.country] = {
						confirmed: i.confirmed,
						deaths: i.deaths,
						recovered: i.recovered
					};
				}

				let green_records = await sequelize.query('select country, province, updateTime, confirmed, deaths, recovered from `Record` where province="Greenland" order by updateTime');

				for (let i of green_records[0]) {
					if (!(i.updateTime in records)) {
						records[i.updateTime] = {};
					}

					records[i.updateTime][i.province] = {
						confirmed: i.confirmed,
						deaths: i.deaths,
						recovered: i.recovered
					};
				}

				result = JSON.stringify(records);
				let redresult = await redis.set(key, result);
				console.log("redis result", redresult);
			}

			// console.log(records);
			if (Object.getOwnPropertyNames(records).length === 0) {
				throw new APIError('404', 'Requested record not found');
			} else {
				ctx.rest(records);
			}
		}
	},{
		method: 'GET',
		path: '/api/record/province/all',
		func: async (ctx, next) => {
			let records = {};
			let pro_records = await sequelize.query('select province, updateTime, confirmed, deaths, recovered from `Record` where province!="" and country="China" order by updateTime, province');

			for (var i of pro_records[0]) {
				if (!(i.updateTime in records)) {
					records[i.updateTime] = {};
				}

				records[i.updateTime][province_en2chi[i.province]] = {
					confirmed: i.confirmed,
					deaths: i.deaths,
					recovered: i.recovered
				};
			}

			if (Object.getOwnPropertyNames(records).length === 0) {
				throw new APIError('404', 'Requested province not found');
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
					['country']
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
			// let start_time = new Date().getTime();
			let key = "na" + getCurrentTime();
			// let get_time = new Date().getTime();
			let result = await redis.get(key);
			// let get_end_time = new Date().getTime();
			// console.log("Get spend ", (get_end_time - get_time) / 1000, "s");

			let news = {};

			if (result) {
				// let parse_time = new Date().getTime();
				news = JSON.parse(result);
				// let parse_end_time = new Date().getTime();
				// console.log("Parse spend ", (parse_end_time - parse_time) / 1000, "s");
			} else {
				let t_news = await sequelize.query('select id, title, pubDate from `News` order by pubDate');
		
				for (var i of t_news[0]) {
					let p_date = getLocalTime(i.pubDate);
					if (!(p_date in news)) {
						news[p_date] = [];
					}
					news[p_date].push({
						id: i.id,
						title: i.title
					});
				}
				result = JSON.stringify(news);
				let redresult = await redis.set(key, result);
				console.log("redis result", redresult);
			}
			if (Object.getOwnPropertyNames(news).length === 0) {
				throw new APIError('404', 'Cannot find any news');
			} else {
				// let rest_start = new Date().getTime();
				ctx.rest(news);
				// let rest_end = new Date().getTime();
				// console.log("Rest spend ", (rest_end - rest_start) / 1000, "s");
			}
			let end_time = new Date().getTime();

			// console.log("news spend ", (end_time - start_time) / 1000, "s");
		}
	},{
		method: 'GET',
		path: '/api/news/find/:id',
		func: async (ctx, next) => {
			let id = ctx.params.id | 'NA';
			let news = await model.News.findAll({
				where: {
					id: id
				}
			});
			if (Object.getOwnPropertyNames(news) == 0) {
				throw new APIError("Request newsID not found");
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
	},{
		method: 'GET',
		path: '/api/soa/count',
		func: async (ctx, next) => {

			let key = "count";
			let result = (await redis.get(key)) | "0";

			result = parseInt(result);
			result = {"count": parseInt(result)}

			ctx.rest(result);
		}
	}
];


module.exports = methods;
