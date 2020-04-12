<template>
<div class="graph">
    <b-container class="basic_container" fluid>
        <b-row>
            <b-col>
                <div>
                    <p>便民服务区</p>
                    <div class="mb-4">
                        <b-avatar variant="light" icon="info-circle"></b-avatar>
                        <b-avatar variant="light" icon="chat"></b-avatar>
                        <b-avatar variant="light" icon="people-fill"></b-avatar>
                        <b-avatar variant="light" icon="search"></b-avatar>
                    </div>
                    <b-list-group style="max-width: 300px;">
                        <b-list-group-item class="d-flex align-items-center">
                            <b-avatar variant="light" icon="info-circle"></b-avatar>
                            <span class="mr-auto">最新消息</span>
                            <b-badge>5</b-badge>
                        </b-list-group-item>
                        <b-list-group-item class="d-flex align-items-center">
                            <b-avatar variant="light" icon="chat"></b-avatar>
                            <span class="mr-auto">心理咨询</span>
                            <b-badge>12</b-badge>
                        </b-list-group-item>
                        <b-list-group-item class="d-flex align-items-center">
                            <b-avatar variant="light" icon="people-fill"></b-avatar>
                            <span class="mr-auto">邻里互助</span>
                            <b-badge>9</b-badge>
                        </b-list-group-item>
                        <b-list-group-item class="d-flex align-items-center">
                            <b-avatar variant="light" icon="search"></b-avatar>
                            <span class="mr-auto">搜索</span>
                            <b-badge>7</b-badge>
                        </b-list-group-item>
                        <b-list-group-item>
                            <b-button href="https://voice.baidu.com/act/newpneumonia/newpneumonia/?from=osari_pc_3" variant="danger" size="lg">新冠病毒</b-button>
                        </b-list-group-item>
                    </b-list-group>
                </div>
            </b-col>

            <b-col>
                <!--    初始化echarts需要个有宽高的盒子-->
                <div ref="mapbox" style="height:800px;width:1200px;margin:0 auto;"></div>
            </b-col>

            <b-col>
                <b-calendar selected-variant="success" today-variant="info"></b-calendar>
            </b-col>
        </b-row>
    </b-container>
</div>
</template>

<script>
import axios from "axios";

const option = {
    grid:{
        left:0,
        top:0,
        right:0,
        bottom:0
    },
    title: {
        text: "疫情地图"
    },
    series: [{
        name: "现存确诊人数",
        type: "map", //告诉echarts要去渲染一个地图
        map: "china",
        label: {
            show: true, // 控制对应地区的汉字
            color: "#333",
            fontSize: 10
        },
        roam: true, //控制地图放大缩小
        zoom: 1.2, //控制地图的放大缩小
        data: [], //用来展示后台给的数据  {name:xx,value:xxx}
        /*      控制地图板块的颜色和边框*/
        itemStyle: {
            areaColor: "#eee",
            borderColor: "green" //边框颜色
        },
        /*     控制鼠标滑过之后的背景色和字体颜色*/
        emphasis: {
            label: {
                color: "#fff",
                fontsize: 12
            },
            itemStyle: {
                areaColor: "#83b5e7"
            }
        }
    }],
    visualMap: [{
        type: "continuous",
        show: true,
        seriesIndex: 0,
        min: 0,
        max: 1000,
        // splitNumber:4,

        // align:'right'
        //orient:'horizontal' 默认竖直
        //left right 这些属性控制分段所在的位置
        //textStyle() 分段大小
        inRange: {
            // symbol: "rect",
            color: ["white", "#9c0505"]
        },
        itemWidth: 20,
        itemHeight: 400
    }],
    tooltip: {
        trigger: "item" //鼠标移入后显示人数
    }
};

export default {
    name: "echarts",
    mounted() {
        //template挂载到页面时调用
        this.mychart = this.$echarts.init(this.$refs.mapbox);
        this.getData(); //执行getData方法
        // this.mychart.setOption(option);
    },
    methods: {
        getData() {
            axios.get("https://lab.isaaclin.cn/nCoV/api/area").then(res => {
                let cur_data = [];
                res.data.results.forEach(item => {
                    if (item.countryEnglishName == "China") {
                        cur_data.push({
                            name: item.provinceShortName,
                            value: item.currentConfirmedCount
                        });
                    }
                });
                option.series[0].data = cur_data;
                this.mychart.setOption(option); //这行代码能执行的前提是DOM已经渲染完成，只有DOM已渲染完成才能echarts初始化
            });
        }
    }
};
</script>

<style scoped></style>
