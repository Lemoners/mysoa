const model = require('./model.js');
const generateId = (name) => {
	return require('./config.js').generateId(name);
};
const fs = require('mz/fs');
const axios = require('axios');
const countries = require('../assets/countries').countries;
const hp2countries = require('../assets/hp_contries2countries');
const redis = require('./db.js').redis;
const CSV = require('comma-separated-values');


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


var vtest_init_redis = async () => {
	let k = "test";
	let v = "hh";
	let res = await redis.set(k,v);

	console.log(`SET WITH ${res}`);

	let get = await redis.get("q");

	console.log(`get with ${get}`);
};

var update_time = async () => {
	let k = "update";
	gt = () => {
				let date = (new Date().toLocaleDateString().split('/').reverse());

				for (let i in date) {
					if (date[i].length == 1) {
						date[i] = "0" + date[i];
					}
				}
				return (date[0] + '-' + date[2] + '-' + date[1]);
			};

	await redis.set(k, gt());
}


var expired_redis = async () => {
	// gt = () => {
	// 	let date = (new Date().toLocaleDateString().split('/').reverse());

	// 	for (let i in date) {
	// 		if (date[i].length == 1) {
	// 			date[i] = "0" + date[i];
	// 		}
	// 	}
	// 	return (date[0] + '-' + date[2] + '-' + date[1]);
	// }
	// let keys = ['rl'+gt(), 'rca'+gt(), 'na'+gt()];

	// for (let i of keys) {
	// 	await redis.del(i);
	// }
	
	redis.flushdb();
};


var init_recovery = async () => {
	console.log("Loading data form NN");
	let data = await axios.get('http://123.56.229.91:8080/data/global');
	data = data.data;

	for (let i in data) {
		let time = data[i].time.split('-');
		time = time[2] + "-" + time[0] + '-' + time[1];
		data[i].time = time;
	}
	console.log("Updating");

	for (let i in data) {
		let today = data[i].data;
		for (let country in today) {

			let t_country = country;

			if(!(country in countries)) {
				if (country in hp2countries) {
					t_country = hp2countries[country];
				} else {
					continue;
				}
			}
			// console.log(t_country);
			if ('recovered' in today[country]) {
				let rc = await model.Record.findAll({
					where: {
						country: t_country,
						province: "",
						updateTime: data[i].time
					}
				});
				if (rc.length != 0) {
					rc = rc[0];
					let num = (today[country].recovered | 0);
					// console.log(num);
					rc.recovered = num;
					await rc.save();
				}
			} else {
				let all = 0;
				for (let province in today[country]) {
					all += today[country][province].recovered | 0;
					let rc = await model.Record.findAll({
						where: {
							country: t_country,
							province: province,
							updateTime: data[i].time
						}
					});
					if (rc.length != 0) {
						rc = rc[0];
						rc.recovered = today[country].recovered | 0;
						await rc.save();
					}
				}

				let rc = await model.Record.findAll({
						where: {
							country: t_country,
							province: "",
							updateTime: data[i].time
						}
					});
				if (rc.length != 0) {
						rc = rc[0];
						rc.recovered = all;
						await rc.save();
				}
			}
		}
	}

};

var init_us = async () => {
	let confirmed = await fs.readFile(__dirname + '/data/csv/US_confirmed.csv'), death = await fs.readFile(__dirname + '/data/csv/US_death.csv');

	confirmed = CSV.parse(confirmed.toString());
	death = CSV.parse(death.toString());

	data = {};

	index2date = {};
	
	for (let i = 11; i < confirmed[0].length; i++) {
		let date = confirmed[0][i];
		date = date.split('/');
		if (date[1].length == 1) {
			date = '20' + date[2] + '-0' + date[0] + '-0' + date[1];
		} else {
			date = '20' + date[2] + '-0' + date[0] + '-' + date[1];
		}
		data[date] = {};
		index2date[i] = date;
	}


	for (let i = 1; i < confirmed.length; i++) {
		let state = confirmed[i][6];
		for (let j = 11; j < confirmed[i].length; j++) {
			if (state in data[index2date[j]]) {
				data[index2date[j]][state].confirmed += parseInt(confirmed[i][j]);
			} else {
				data[index2date[j]][state]= {
					confirmed: parseInt(confirmed[i][j]),
					deaths: 0,
					recovered: 0
				};
			}
		}
	}

	for (let i = 1; i < death.length; i++) {
		let state = death[i][6];
		for (let j = 11; j < 11 + Object.getOwnPropertyNames(index2date).length; j++) {
			if (state in data[index2date[j]]) {
				data[index2date[j]][state].deaths += parseInt(death[i][j+1]);
			}
		}
	}

	for (let d in data) {
		for (let p in data[d]) {
			let conf = data[d][p].confirmed,
			dea = data[d][p].deaths,
			rec = data[d][p].recovered,
			id = generateId("United States" + p + d);
			await model.Record
				.findOrCreate({
					where: {
						id: id
					},
					defaults: {
						id: id,
						country: "United States",
						province: p,
						updateTime: d,
						confirmed: conf,
						deaths: dea,
						recovered: rec
					}
				})
				.spread((record, created) => {
					if (created === false) {
						record.update({
							country: "United States",
							province: p,
							updateTime: d,
							confirmed: conf,
							deaths: dea,
							recovered: rec
						});
					}
				});
		}
	}
};


var init_csv = async () => {
	let confirmed = await fs.readFile(__dirname + '/data/csv/confirmed.csv'), recovered = await fs.readFile(__dirname + '/data/csv/recovered.csv'),
	death = await fs.readFile(__dirname + '/data/csv/death.csv');

	confirmed = CSV.parse(confirmed.toString());
	recovered = CSV.parse(recovered.toString());
	death = CSV.parse(death.toString());

	// for (let i = 1; i < recovered.length; i++) {
	// 	let province = recovered[i][0];
	// 	let country = recovered[i][1];
	// 	if (country == "Canada") {
	// 		console.log(province);
	// 	}
	// }
	// return

	for (let i = 1; i < recovered.length; i++) {
		let province = recovered[i][0];
		let country = recovered[i][1];
		
		if (!(country in countries)) {
			if (country in hp2countries) {
				country = hp2countries[country];
			} else {
				continue;
			}
		}

		for (let j = 4; j < recovered[0].length; j++) {
			let date = recovered[0][j];
			date = date.split('/');
			if (date[1].length == 1) {
				date = '20' + date[2] + '-0' + date[0] + '-0' + date[1];
			} else {
				date = '20' + date[2] + '-0' + date[0] + '-' + date[1];
			}
			

			let rec = recovered[i][j] | 0,
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
						confirmed: 0,
						deaths: 0,
						recovered: rec
					}
				})
				.spread((record, created) => {
					if (created === false) {
						record.update({
							country: country,
							province: province,
							updateTime: date,
							recovered: rec
						});
					}
				});
		}
	}
	console.log("Finish recovered");
	for (let i = 1; i < confirmed.length; i++) {
		let province = confirmed[i][0];
		let country = confirmed[i][1];
		
		if (!(country in countries)) {
			if (country in hp2countries) {
				country = hp2countries[country];
			} else {
				continue;
			}
		}

		for (let j = 4; j < confirmed[0].length; j++) {
			let date = confirmed[0][j];
			date = date.split('/');
			if (date[1].length == 1) {
				date = '20' + date[2] + '-0' + date[0] + '-0' + date[1];
			} else {
				date = '20' + date[2] + '-0' + date[0] + '-' + date[1];
			}
			

			let conf = confirmed[i][j] | 0,
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
						deaths: 0,
						recovered: 0
					}
				})
				.spread((record, created) => {
					if (created === false) {
						record.update({
							country: country,
							province: province,
							updateTime: date,
							confirmed: conf,
						});
					}
				});
		}


	}
	console.log("Finish confirmed");
	for (let i = 1; i < death.length; i++) {
		let province = death[i][0];
		let country = death[i][1];
		
		if (!(country in countries)) {
			if (country in hp2countries) {
				country = hp2countries[country];
			} else {
				continue;
			}
		}
		for (let j = 4; j < death[0].length; j++) {
			let date = death[0][j];
			date = date.split('/');
			if (date[1].length == 1) {
				date = '20' + date[2] + '-0' + date[0] + '-0' + date[1];
			} else {
				date = '20' + date[2] + '-0' + date[0] + '-' + date[1];
			}
			

			let dea = death[i][j] | 0,
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
						confirmed: 0,
						deaths: dea,
						recovered: 0
					}
				})
				.spread((record, created) => {
					if (created === false) {
						record.update({
							country: country,
							province: province,
							updateTime: date,
							deaths: dea,
						});
					}
				});
		}
	}
	console.log("Finish death");
	console.log("init records ok");
};


(async ()=>{
    model.loadModels();
    // init table
    await model.sync();

    // await initrumors();
    // await initnews();
    // await initrecord();
	
	// await init_csv();
	// await init_us();

	// await initbaidu();
	// await expired_redis();


	await update_time();

	//data from niuniu
	// await init_recovery();

})().then((res) => {
	console.log("ok");
	process.exit(0);
}).catch((err) => {
	console.log("fail", err);
	process.exit(-1);
})
