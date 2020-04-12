const model = require('./model.js');
const generateId = (name) => {
    return require('./config.js').generateId(name);
};
const fs = require('mz/fs');


var initrecord = async () => {
    // model.loadModels();
    // init table
    // model.sync()

    var data = await fs.readFile(__dirname + '/data/data_record.json');
    // var data = await fs.readFile(__dirname + '/data/BaiduIndex/data_baidu.json');

    data = JSON.parse(data);
    
    for (var d of data) {
        let name = d.name,
        updateTime = d.updateTime,
        currentConfirmedCount = d.currentConfirmedCount,
        suspectedCount = d.suspectedCount,
        curedCount = d.curedCount,
        deadCount = d.deadCount,
        id = generateId(name + updateTime);
        
        var test_rec = await model.Record.findOrCreate({
            where: {
                id: id
            },
            defaults: {
                id: id,
                name: name,
                updateTime: updateTime,
                currentConfirmedCount: currentConfirmedCount,
                suspectedCount: suspectedCount,
                curedCount: curedCount,
                deadCount: deadCount
            }
        }).spread((record, created) => {
            if (created === false) {
                record.update({
                    name: name,
                    updateTime: updateTime,
                    currentConfirmedCount: currentConfirmedCount,
                    suspectedCount: suspectedCount,
                    curedCount: curedCount,
                    deadCount: deadCount
                });
            }
        });
    }
}


var initbaidu =  async () => {
    // model.loadModels();
    // init table
    // model.sync()

    // var data = await fs.readFile(__dirname + '/data/clean_data.json');
    var data = await fs.readFile(__dirname + '/data/BaiduIndex/data_baidu.json');

    data = JSON.parse(data);
    
    for (var d of data) {
        let province = d.province,
        date = d.date,
        type = d.type,
        index = d.index,
        id = generateId(province + date + type);
        
        var test_rec = await model.BaiduIndex.findOrCreate({
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
        }).spread((baiduindex, created) => {
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
}

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
        
        var test_rec = await model.News.findOrCreate({
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
        }).spread((news, created) => {
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
}

var initrumors = async () => {
    // var data = await fs.readFile(__dirname + '/data/clean_data.json');
    var data = await fs.readFile(__dirname + '/data/DXY-COVID-19-Data/json/DXYRumors-TimeSeries.json');

    data = JSON.parse(data);
    

    for (var d of data) {
        let id = d.id,
        crawlTime= d.crawlTime,
        title = d.title,
        mainSummary = d.mainSummary,
        body = d.body;

        if (title.length > 100 || mainSummary.length > 100 || body.length > 500) {
            continue;
        }
        
        var test_rec = await model.Rumor.findOrCreate({
            where: {
                id: id
            },
            defaults: {
                id: id,
                crawlTime: crawlTime,
                title: title,
                mainSummary: mainSummary,
                body: body
            }
        }).spread((rumor, created) => {
            if (created === false) {
                rumor.update({
                    crawlTime: crawlTime,
                    title: title,
                    mainSummary: mainSummary,
                    body: body
                });
            }
        });
    }
}

(async()=>{
    model.loadModels();
    // init table
    await model.sync();

    await initrumors();
    console.log("init rumors ok");
    await initnews();
    console.log("init news ok");
    await initrecord();
    console.log("init record ok");
    await initbaidu();
    console.log("init baidu ok");

})().then((result) => {
    console.log("ok", result);
}).catch((err) => {
    console.log("fail", err);
})