<template>
    <div>
        <b-card-group columns>
            <b-card v-for="item of province_code" :key="item.code" :title="item.name" tag="article" style="width: 40rem;">

                <card :code="item.code" style="height: 15rem"></card>
                <b-button v-on:click="goDetail" :value="item.code" variant="primary">详情</b-button>
            </b-card>
        </b-card-group>
    </div>
</template>

<script>
import scrollNews from "./scrollNews.vue";
import card from "./card.vue";

const province_code = require('../assets/province.js').province;


export default {
    name: "cards",
    methods: {
        goDetail(event) {
            const target = event.toElement.value;
            var url = '/scard/' + target;
            this.$router.push(url);
        }
    },
    data() {
        return {
            province_code: province_code
        };
    },
    components: {
    card,
    scrollNews
    // index,
    },
};
</script>