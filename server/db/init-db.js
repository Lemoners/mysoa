const model = require('./model.js');
const generateId = (name) => {
	return require('./config.js').generateId(name);
};
const fs = require('mz/fs');
const axios = require('axios');
const countries = require('../assets/countries').countries;
const hp2countries = require('../assets/hp_contries2countries').hp_country2country;
const redis = require('./db.js').redis;


var initbaidu = async () => {
	// model.loadModels();
	// init table
	// model.sync()

	// var data = await fs.readFile(__dirname + '/data/clean_data.json');
	var data = await fs.readFile(__dirname + '/data/clean_data/data_baidu.json');

	data = JSON.parse(data);

	for (var d of data) {
		let province = d.province,
			date = d.date,
			type = d.type,
			index = d.index,
			id = generateId(province + date + type);

		var test_rec = await model.BaiduIndex
			.findOrCreate({
				where: {
					id: id
				},
				defaults: {
					id: id,
					province: province,
					date: date,
					type: type,
					index: index
				}
			})
			.spread((baiduindex, created) => {
				if (created === false) {
					baiduindex.update({
						province: province,
						date: date,
						type: type,
						index: index
					});
				}
			});
    }
    console.log("init indexs ok");
};

var initnews = async () => {
	// var data = await fs.readFile(__dirname + '/data/clean_data.json');
	var data = await fs.readFile(__dirname + '/data/DXY-COVID-19-Data/json/DXYNews-TimeSeries.json');

	data = JSON.parse(data);

	max_length = -1;

	for (var d of data) {
		let id = d.id,
			pubDate = d.pubDate,
			sourceUrl = d.sourceUrl,
			title = d.title,
			summary = d.summary;

		if (summary.length > 500 || title.length > 200 || sourceUrl.length > 250) {
			continue;
		}

		var test_rec = await model.News
			.findOrCreate({
				where: {
					id: id
				},
				defaults: {
					id: id,
					pubDate: pubDate,
					sourceUrl: sourceUrl,
					title: title,
					summary: summary
				}
			})
			.spread((news, created) => {
				if (created === false) {
					news.update({
						pubDate: pubDate,
						sourceUrl: sourceUrl,
						title: title,
						summary: summary
					});
				}
			});
    }
    console.log("init news ok");
};

var initrumors = async () => {
	// var data = await fs.readFile(__dirname + '/data/clean_data.json');
	var data = await fs.readFile(__dirname + '/data/DXY-COVID-19-Data/json/DXYRumors-TimeSeries.json');

	data = JSON.parse(data);

	for (var d of data) {
		let id = d.id,
			crawlTime = d.crawlTime,
			title = d.title,
			mainSummary = d.mainSummary,
			body = d.body,
			rumorType = d.rumorType;

		if (title.length > 100 || mainSummary.length > 100 || body.length > 500) {
			continue;
		}

		var test_rec = await model.Rumor
			.findOrCreate({
				where: {
					id: id
				},
				defaults: {
					id: id,
					crawlTime: crawlTime,
					title: title,
					mainSummary: mainSummary,
					body: body,
					rumorType: rumorType
				}
			})
			.spread((rumor, created) => {
				if (created === false) {
					rumor.update({
						crawlTime: crawlTime,
						title: title,
						mainSummary: mainSummary,
						body: body,
						rumorType: rumorType
					});
				}
			});
    }
    console.log("init rumors ok");
};

var initrecord = async () => {
	var data = await fs.readFile(__dirname + '/data/clean_data/hp.json');

	// var data = await axios.get("https://coronavirus-tracker-api.herokuapp.com/v2/locations?timelines=1")
	data = JSON.parse(data);

	// for (var d of data.locations) {
	// 	if (!(d.country in countries)) {
	// 		console.log("Coun:", d.country);
	// 	}
	// }


	for (var d of data.locations) {
		let country = d.country,
			province = d.province;
		
		if(!(country in countries)) {
			if (country in hp2countries) {
				country = hp2countries[country];
			} else {
				continue;
			}
		} 

		let confirmed_timeline = d.timelines.confirmed.timeline;
		let confirmed = {};
		for (var c in confirmed_timeline) {
			let date = c.substring(0, 10);
			confirmed[date] = confirmed_timeline[c];
		}

		let deaths_timeline = d.timelines.deaths.timeline;
		let deaths = {};
		for (var dea in deaths_timeline) {
			let date = dea.substring(0, 10);
			deaths[date] = deaths_timeline[dea];
		}

		let recovered_timeline = d.timelines.recovered.timeline;
		let recovered = {};
		for (var r in recovered_timeline) {
			let date = r.substring(0, 10);
			recovered[date] = recovered_timeline[r];
		}

		for (var date in confirmed) {
			let conf = confirmed[date],
				dea = deaths[date] | 0,
				rec = recovered[date] | 0,
				id = generateId(country + province + date);

			var test_rec = await model.Record
				.findOrCreate({
					where: {
						id: id
					},
					defaults: {
						id: id,
						country: country,
						province: province,
						updateTime: date,
						confirmed: conf,
						deaths: dea,
						recovered: rec
					}
				})
				.spread((record, created) => {
					if (created === false) {
						record.update({
							country: country,
							province: province,
							updateTime: date,
							confirmed: conf,
							deaths: dea,
							recovered: rec
						});
					}
				});
		}
    }
    console.log("init records ok");
};


test_init_redis = async () => {
	let k = "test";
	let v = "hh";
	let res = await redis.set(k,v);

	console.log(`SET WITH ${res}`);

	let get = await redis.get("q");

	console.log(`get with ${get}`);
};


(async ()=>{
    model.loadModels();
    // init table
    await model.sync();

    await initrumors();
    await initnews();
    await initrecord();
	await initbaidu();
	
	// await test_init_redis();

})().then((res) => {
	console.log("ok");
}).catch((err) => {
	console.log("fail", err);
})
