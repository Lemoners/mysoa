import Vue from 'vue';
import App from './App.vue';
import VueRouter from 'vue-router';
Vue.use(VueRouter);

// ecahrts
import echarts from 'echarts';
import 'echarts-gl';
import 'echarts/map/js/china';
import 'echarts/map/js/world';

Vue.prototype.$echarts = echarts;
Vue.config.productionTip = false;

// import bootstrap
import { BootstrapVue, BootstrapVueIcons } from 'bootstrap-vue';
import 'bootstrap/dist/css/bootstrap.css';
import 'bootstrap-vue/dist/bootstrap-vue.css';
Vue.use(BootstrapVue);
Vue.use(BootstrapVueIcons);

//axios
import axios from 'axios';
Vue.prototype.$axios = axios;

Vue.prototype.stats = function(a) {
	if (a.confirmed) return [ Number(a.confirmed), Number(a.recovered), Number(a.death) ];
	else {
		var c = 0,
			r = 0,
			d = 0;
		for (var key in a) {
			var s = this.stats(a[key]);
			c += s[0];
			r += s[1];
			d += s[2];
		}
		return [ c, r, d ];
	}
};

import index from './components/index.vue';
import mycards from './components/cards.vue';
import mysinglecard from './components/card.vue';

const router = new VueRouter({
	mode: 'history',
	routes: [
		{
			path: '/',
			component: index
		},
		{
			path: '/cards',
			component: mycards
		},
		{
			path: '/scard/:code',
			component: mysinglecard
		}
	]
});	

new Vue({
	router: router,
	render: (h) => h(App)
}).$mount('#app');
