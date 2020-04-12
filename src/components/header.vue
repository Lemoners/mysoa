<template>
  <div id="header" >
    <div id="titleContainer">
      <span id="headerTitle" style="font-size: 40px;" >新冠病毒疫情动态信息</span>
    </div>
    <div id="timeContainer" style="font-size: 100px; margin-left: 10px margin-right: 10px">
      <span id="date"></span>
      <span id="clock"></span>
    </div>
    <div id="buttonContainer" style="margin-top: 20px">
      <button v-on:click="jump" style="color:white;background-color:rgba(0,0,0,0.2)">Cards</button>
    </div>
    <div id="newsContainer">
      <transition name="slide" >
        <p class="text" :key="text.id" style="font-size: 20px;">
          <a :href="text.url" target="_blank" style="color: darkorange">{{text.val}}</a>
        </p>
      </transition>
    </div>
  </div>
</template>

<script>
    import $ from  'jquery'
    import axios from "axios";
    setInterval(function(){
        var date = new Date();
        var y = date.getFullYear();
        var m =date.getMonth()+1;
        var d = date.getDate();
        var w = date.getDay();
        var ww = ' 星期'+'日一二三四五六'.charAt(w) ;//星期几
        var h = date.getHours();
        var minute = date.getMinutes()
        var s = date.getSeconds(); //秒
        var sss = date.getMilliseconds() ; //毫秒
        if(m<10){
            m = "0"+m;
        }
        if(d<10){
            d = "0"+d;
        }
        if(h<10){
            h = "0"+h;
        }
        if(minute<10){
            minute = "0"+minute;
        }
        if(s<10){
            s = "0"+s;
        }
        if(sss<10){
            sss = "00"+sss;
        }else if(sss<100){
            sss = "0"+sss;
        }
        let html = "";
        html = html + '<span style="float:left">' + h + "</span>";
        html =
            html +
            '<span id="online" style="width:16px; display:block; float:left">' +
            ": " +
            "</span>";
        html = html + '<span style="float:left">' + minute + "</span>";
        html =
            html +
            '<span id="online2" style="width:16px; display:block; float:left">' +
            ": " +
            "</span>";
        html = html + '<span style="float:left">' + s + "</span>";
        $("#date").text(y + " " + m + " " + d + " " + ww);
        $("#clock").html(html);
    },1000);


    export default {
        name: "header.vue",
        data() {
            return {
                textArr: [],
                number: 0
            }
        },
        computed: {
            text() {
                return {
                    id: this.number,
                    val: this.textArr[this.number] == undefined ? undefined:this.textArr[this.number].text,
                    url: this.textArr[this.number] == undefined ? undefined:this.textArr[this.number].url,
                }
            }
        },
        mounted() {
            this.startMove()
            this.getNews()
        },
        methods: {
            jump() {
                if (this.$router.currentRoute.path === '/') {
                    this.$router.push("/cards");
                } else {
                    this.$router.push("/");
                }

            },
            startMove() {
                // eslint-disable-next-line
                let timer = setTimeout(() => {
                    if (this.number === this.textArr.length) {
                        this.number = 0;
                    } else {
                        this.number += 1;
                    }
                    this.startMove();
                }, 2000); // 滚动不需要停顿则将2000改成动画持续时间
            },
            getNews() {
                axios.get('https://lab.isaaclin.cn/nCoV/api/news').then(res => {
                    // let news = []
                    res.data.results.forEach(item => {
                            this.textArr.push({text:item.title, url:item.sourceUrl})
                        }
                    );   //从接口获取到数据后，使用map()函数，进行接口数据映射
                })
            }
        }
    }
</script>

<style scoped>
#header {
  position: fixed;
  z-index: 2;
  width: 100%;
  background-color: rgba(1, 6, 17, 0.6);
  height: 9%;
}
#titleContainer {
  float: left;
  margin: 1% auto auto auto;
  border-right: 1px solid #fff;
  padding-right: 1%;
}
#headerTitle {
  letter-spacing: 3.5px;
  color: #fff;
  font-size: 0.28rem;
  line-height: 46px;
  display: block;
}
#timeContainer {
  float: left;
  text-align: center;
  margin-left: 1%;
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
}
#date {
  display: block;
  font-size: 15px;
  font-weight: normal;
  line-height: 24px;
  color: #fff;
}
#clock {
  display: block;
  letter-spacing: 3.5px;
  color: #fff;
  font-size: 0.28rem;
  line-height: 0.28rem;
}
#buttonContainer {
  float: left;
  font-size: 10px;
  width: 5%;
  top: 5%;
  height: 60%;
  margin: 1% auto auto auto;
  overflow: hidden;
  display: block;
  border-left: 1px solid #fff;
  padding-left: 0%;
}
#newsContainer {
  float: right;
  height: 60%;
  width: 20%;
  margin: 1% auto auto auto;
  overflow: hidden;
  display: block;
  border-left: 1px solid #fff;
  padding-left: 1%;
}
.text {
  width: 100%;
  color: #fff;
  font-size: 0.15rem;
  /*position: absolute;*/
  bottom: 0;
  text-align: left;
}
.slide-enter-active,
.slide-leave-active {
  transition: all 0.5s linear;
}
.slide-enter {
  transform: translateY(20px) scale(1);
  opacity: 1;
}
.slide-leave-to {
  transform: translateY(-20px) scale(0.8);
  opacity: 0;
}
</style>