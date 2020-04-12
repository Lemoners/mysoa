<template >
    <div>
        <myHeader></myHeader>
        <worldmap></worldmap>
        <BotPanel></BotPanel>
    </div>
</template>

<script>
import worldmap from './worldmap.vue';
import myHeader from './header.vue';
import BotPanel from './BotPanel.vue';

export default {
    name: "index",
    components: {
        worldmap,
        myHeader,
        BotPanel
    }
}
</script>