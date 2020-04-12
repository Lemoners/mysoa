<template>
    <div id="worldmap">
        <div ref="mapbox" style="height:100%;width:100%;margin:0 auto; position: absolute;"></div>
    </div>
</template>

<script>
import 'echarts/map/js/world'
import axios from "axios";

const baseOption = {
    backgroundColor: '#1a1a1a',
    timeline: {
        tooltip: {
            formatter: '{b}'
        },

        loop:false,
        axisType: 'category',
        playInterval: 1000,
        data: []
    },
    grid: {
        left: '6%',
        top: '9%',
        right: '80% '
    },
    xAxis: {
        type: 'value',
        boundaryGap: [0, 0.01],
        splitLine:{
            show:false
        },
        axisLabel:{
            color: "white",
        },
    },
    yAxis: {
        type: 'category',
        axisLabel:{
            color: "white",
        },
        boundaryGap: true,
        splitLine:{
            show:false
        },
    },
    dataZoom: [
        {
            show: true,
            start: 0,
            end: 100,
            height:10
        },
        {
            type: 'inside',
            start: 0,
            end: 100
        },
        {
            show: true,
            yAxisIndex: 0,
            filterMode: 'empty',
            width: 10,
            height: '80%',
            showDataShadow: false,
            start:90,
            end:100,
            left: '0%'
        }
    ],
    title: {
        text: 'COVID-19',
        subtext: 'data from John Hopkins',
        sublink: 'https://www.baidu.com/',
        left: 'center',
        top: 10,
        right: '10%',
        itemGap: 0,
        textStyle: {
            fontSize: 40,
            color: '#eee'
        },
        subtextStyle: {
            fontSize: 15,
            color: 'gray'
        },
        z: 200
    },tooltip: {
        trigger: 'item',
        formatter: function (params) {
            var value = (params.value + '').split('.');
            value = value[0].replace(/(\d{1,3})(?=(?:\d{3})+(?!\d))/g, '$1,');
            return params.name + '<br/>' + params.seriesName + ' : ' + value;
        }
    },
    toolbox: {
        show: false,
    },
    geo: {
        map: 'world',
        roam: true,
        label: {
            emphasis: {
                show: false
            }
        },
        show: false,
        silent: true,
        itemStyle: {
            normal: {
                areaColor: '#323c48',
                borderColor: '#111'
            },
            emphasis: {
                areaColor: '#2a333d'
            }
        }
    },
    visualMap: {
        type: 'continuous', // continuous 类型为连续型  piecewise 类型为分段型
        show: true, // 是否显示 visualMap-continuous 组件 如果设置为 false，不会显示，但是数据映射的功能还存在
        // 指定 visualMapContinuous 组件的允许的最小/大值。'min'/'max' 必须用户指定。
        // [visualMap.min, visualMax.max] 形成了视觉映射的『定义域』
        min: 1,
        max: 10000,
        // 文本样式
        textStyle: {
            fontSize: 14,
            color: '#fff'
        },
        right: '15%',
        bottom: '5%',
        realtime: false, // 拖拽时，是否实时更新
        calculable: true, // 是否显示拖拽用的手柄
        // 定义 在选中范围中 的视觉元素
        inRange: {
            color: ['#f9d2ab', 'yellow', 'orange', '#ff0112', '#370306'] // 图元的颜色
        }
    },
    series : [{
        name: "confirmed",
        type: 'map',
        mapType: 'world',
        roam:true,
        itemStyle: {
            borderWidth: 0.5,
            borderColor: '#000',
            borderType: 'solid'
        },
        zlevel:-1
    },{
        name: 'confirmed',
        type: 'bar',
        stack: 'total',
        color: 'rgba(255,0,0,0.2)',
    },
        {
            name: 'recovered',
            type: 'bar',
            stack: 'total',
            color: 'rgba(125,255,22,0.2)',
        },
        {
            name: 'death',
            type: 'bar',
            stack: 'total',
            color: 'rgba(242,232,255,0.4)',
        }],
}
var options = []

export default {
    name: "worldmap",
    mounted() {
        //template挂载到页面时调用
        this.mychart = this.$echarts.init(this.$refs.mapbox);
        this.mychart.showLoading({
            text: '数据加载中，请耐心等待',
            textColor: 'white',
            color: '#c23531',
            maskColor: 'rgba(0, 0, 0, 0.8)',
        })
        this.getData(); //执行getData方法
        this.mychart.setOption({baseOption:baseOption, options:options});
    },
    methods: {
        getData() {
            axios.get("http://123.56.229.91:8080/data/global").then((res) => {
                console.log("getdata", res);
                var timeline_data = []
                res.data.forEach(item=>{
                    timeline_data.push(item.time)
                    var series = [{data:[]},{data:[]},{data:[]},{data:[]}];
                    var data  = []
                    for (var key in item.data){
                        var name = key;
                        if (name == 'Mainland China')
                            name = 'China'
                        else if (name == 'US')
                            name = 'United States'
                        else if (name == 'South Sudan')
                            name = 'S. Sudan'

                        var s = this.stats(item.data[key])
                        series[0].data.push({name:name, value:s[0]})
                        data.push({name:name, c:s[0], r:s[1], d:s[2]})
                    }
                    data.sort((a, b) => b.c-a.c)
                    var cnt = data.length
                    var option={
                        yAxis:{
                            data:[]
                        },
                        series:[]
                    }
                    for (var i = 0; i < cnt; ++i) {
                        option.yAxis.data.push(data[cnt-1-i].name)
                        series[1].data.push({value:data[cnt-1-i].c - data[cnt-1-i].r- data[cnt-1-i].d, visualMap:false})
                        series[2].data.push({value:data[cnt-1-i].r, visualMap:false})
                        series[3].data.push({value:data[cnt-1-i].d, visualMap:false})
                    }
                    option.series = series
                    options.push(option);
                })
                baseOption.timeline.data = timeline_data
                baseOption.timeline.curIndex = timeline_data.length - 1;
                this.mychart.hideLoading()
                this.mychart.setOption({baseOption:baseOption, options:options}); //这行代码    能执行的前提是DOM已经渲染完成，只有DOM已渲染完成才能echarts初始化
            }).catch((err) => {
                console.log("loading fail", err);
                this.mychart.hideLoading();
            });
        }
    }
};
</script>


<style scoped>
    #worldmap {
        position: fixed;
        width: 100%;
        height: 100%;
        top: 0%;
        z-index: 1;
        background-color: rgba(3, 2, 28, 0.6);
    }
</style>
