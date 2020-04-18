const APIError = require('../rest').APIError;
const model = require('../db/model.js');
const sequelize = require('../db/db.js').sequelize;
const province_code = require('../assets/province.js').province;

function getLocalTime(nS) {
    let date =  (new Date(parseInt(nS)).toLocaleString().split(',')[0].split('/').reverse());
	for (let i in date) {
		if (date[i].length == 1) {
			date[i] = "0" + date[i];
		}
	}
	return date.join("-");
}



module.exports = [
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
			
			var records = {};
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

			let records = {};
			let coun_records = await sequelize.query('select country, updateTime ,sum(confirmed) as confirmed, sum(deaths) as deaths, sum(recovered) as recovered from `Record` group by country, updateTime order by updateTime, country;')

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

				records[i.updateTime][i.province] = {
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
			let news = {};
			let t_news = await sequelize.query('select pubDate, sourceUrl, title, summary from `News` order by pubDate');
		
			for (var i of t_news[0]) {
				let p_date = getLocalTime(i.pubDate);
				if (!(p_date in news)) {
					news[p_date] = [];
				}
				news[p_date].push({
					sourceUrl: i.sourceUrl,
					title: i.title,
					summary: i.summary
				});
			}

			if (Object.getOwnPropertyNames(news).length === 0) {
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
