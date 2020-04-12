<template>
    <div ref="cardmap" style="height: 90%; width: 90%; margin: 0 auto;">
    </div>
</template>

<script>

const e2c = {'wise': '智能手机', 'pc': '电脑', 'news': '新闻媒体', 'all': '个人'};


export default {
    name: 'card',
    data: function() {
        return {
            option : {
                title: {
                    text: '搜索指数'
                },
                tooltip: {
                    trigger: 'axis'
                },
                legend: {
                    data: ['智能手机', '电脑', '新闻媒体', '个人']
                },
                grid: {
                    left: '3%',
                    right: '4%',
                    bottom: '3%',
                    containLabel: true
                },
                // toolbox: {
                //     feature: {
                //         saveAsImage: {}
                //     }
                // },
                xAxis: {
                    type: 'category',
                    boundaryGap: false,
                    data: []
                    // data: ['周一', '周二', '周三', '周四', '周五', '周六', '周日']
                },
                yAxis: {
                    type: 'value'
                },
                series: [
                    {
                        name: '智能手机',
                        type: 'line',
                        stack: '搜索指数',
                        data: []
                    },{
                        name: '电脑',
                        type: 'line',
                        stack: '搜索指数',
                        data: []
                    },{
                        name: '新闻媒体',
                        type: 'line',
                        stack: '搜索指数',
                        data: []
                    },{
                        name: '个人',
                        type: 'line',
                        stack: '搜索指数',
                        data: []
                    }
                ]
            }
        }
    },
    props: ['code'],
    methods: {
        getData(resolve, reject) {
            // var that = this;
            var code = this.$props.code || 'NA';
            if (code === 'NA') {
                code = this.$router.currentRoute.path.split('/');
                code = code[code.length-1];
            }
            this.$axios.get('/api/card/' + code).then((result) => {
                // console.log("rev" ,result);
                resolve(result);
            }).catch((err) => {
                // console.log("fail" ,err);
                reject(err);
            });
        }
    },
    mounted() {
        this.mychart = this.$echarts.init(this.$refs.cardmap);
        new Promise(this.getData).then((result) => {
            // console.log("OVER", result);
            for (var obj of result.data) {
                if (this.option.xAxis.data.indexOf(obj.date) == -1) {
                    this.option.xAxis.data.push(obj.date);
                }
                
                for (var i in this.option.series) {
                    if (this.option.series[i].name === e2c[obj.type]) {
                        this.option.series[i].data.push(obj.index);
                    }
                }
            }
            this.mychart.setOption(this.option);

        })
    }
}
</script>