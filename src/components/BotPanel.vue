<template>
    <div id="BotPanel">
        <div ref="barbox" style="height:100%;width:100%;margin:0 auto; position: absolute;"></div>
    </div>
</template>

<script>
    import axios from "axios";

    var option = {
        title: {
            text: '世界疫情统计'
        },
        tooltip: {
            trigger: 'axis',
            formatter: function (params) {
                params = params[0];
                var date = new Date(params.name);
                return date.getDate() + '/' + (date.getMonth() + 1) + '/' + date.getFullYear() + ' : ' + params.value[1];
            },
            axisPointer: {
                animation: false
            }
        },
        grid:{
            bottom:"5"
        },
        legend: {
            data: [{name:'累计确诊', icon:"circle"}, {name:'累计治愈', icon:"rect"}, {name:'累计死亡', icon:"diamond"}],
            textStyle:{color:"white"}
        },
        xAxis: {
            type: 'category',
            splitLine: {
                show: false
            },
            data:[]
        },
        yAxis: {
            type: 'value',
            boundaryGap: [0, '100%'],
            splitLine: {
                show: true
            }
        },
        series: [{
            name: '累计确诊',
            type: 'line',
            showSymbol: true,
            hoverAnimation: false,
            lineStyle:{
                color: "red"
            },
            data:[]
        },
            {
                name: '累计治愈',
                type: 'line',
                showSymbol: true,
                hoverAnimation: false,
                lineStyle:{
                    color: "green"
                },
                data:[]
            },
            {
                name: '累计死亡',
                type: 'line',
                showSymbol: true,
                hoverAnimation: false,
                data:[]
            }]
    };

    export default {
        name: "BotPanel",
        mounted() {
            //template挂载到页面时调用
            this.mychart = this.$echarts.init(this.$refs.barbox);
            this.mychart.showLoading({
                text: '',
                color: '#c23531',
                maskColor: 'rgba(0, 0, 0, 0.1)',
            })
            this.getData()
        },
        methods: {
            getData(){
                axios.get("http://123.56.229.91:8080/data/global").then(res => {
                    var c_data = []
                    var r_data = []
                    var d_data = []
                    res.data.forEach(item=>{
                        var s = this.stats(item.data)
                        option.xAxis.data.push(item.time)
                        c_data.push(s[0])
                        r_data.push(s[1])
                        d_data.push(s[2])
                    })
                    option.series[0].data = c_data
                    option.series[1].data = r_data
                    option.series[2].data = d_data
                    this.mychart.hideLoading()
                    this.mychart.setOption(option)
                })

            }
        }
    }
</script>


<style scoped>
    #BotPanel {
        position: fixed;
        width: 60%;
        left: 20%;
        height: 30%;
        bottom: 0;
        top: 60%;
        z-index: 2000;
        background-color: rgba(1, 6, 17, 0.2);
    }
</style>