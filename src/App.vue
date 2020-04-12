<template>
<div id="app">
  <router-view style="height:95%; width: 100%; margin:0 auto; position: absolute"></router-view>

</div>
</template>


<script>
// components
// import echarts from "./components/echarts.vue";


// import virus from './components/virus.vue';
// import scrollNews from './components/scrollNews.vue';
export default {
  name: "App",
  components: {
    // echarts,
    // scrollNews
    // index,
  },
  methods: {
    go_home() {
      this.$router.push('/');
    },
    jump(event) {
      const target = event.toElement.text;

      let url = null;
      switch(target) {
        case 'World':
          url = '/';
          break;
        case 'Cards':
          url = '/cards';
          break;
        default:
          console.log("NO TARGET URL MATCH");
          url = '/';
          break;
      }
      // console.log(this.$router.currentRoute);
      console.log(url);

      if (url === this.$router.currentRoute.path) {
        return;
      }

      this.$router.push(url);
    }
  }
};
</script>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-left: 5px;
  margin-right: 5px;  
};
</style>
