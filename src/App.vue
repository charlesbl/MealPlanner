<script setup lang="ts">
import Chat from "./components/pages/Chat.vue";
import Deck from "./components/pages/Deck.vue";
import Week from "./components/pages/Week.vue";
</script>

<template>
    <div class="app-container">
        <div class="page"><Deck /></div>
        <div class="page"><Chat /></div>
        <div class="page"><Week /></div>
    </div>
</template>

<style scoped>
.app-container {
    display: grid;
    grid-template-columns: repeat(3, 100vw);
    height: 100vh;
    overflow-x: auto;
    scroll-snap-type: x mandatory;
    scroll-behavior: smooth;
    -webkit-overflow-scrolling: touch;
    overscroll-behavior-x: contain;
}

.page {
    scroll-snap-align: start;
    scroll-snap-stop: always;
    overflow-y: auto;
}
</style>
