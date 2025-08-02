<script setup lang="ts">
import { onMounted, ref } from "vue";
import Chat from "./components/pages/Chat.vue";
import Deck from "./components/pages/Deck.vue";
import Week from "./components/pages/Week.vue";

const appContainer = ref<HTMLElement>();

onMounted(() => {
    // Scroll to the Chat page (middle page) on app load without animation
    if (appContainer.value) {
        appContainer.value.scrollLeft = window.innerWidth;

        // Show the container and enable smooth scrolling
        requestAnimationFrame(() => {
            if (appContainer.value) {
                appContainer.value.style.scrollBehavior = "smooth";
                appContainer.value.classList.add("loaded");
            }
        });
    }
});
</script>

<template>
    <div ref="appContainer" class="app-container">
        <div class="page"><Deck /></div>
        <div class="page"><Chat /></div>
        <div class="page"><Week /></div>
    </div>
</template>

<style scoped>
.app-container {
    display: grid;
    grid-template-columns: repeat(3, 100vw);
    height: 100dvh;
    overflow: hidden;
    overflow-x: auto;
    scroll-snap-type: x mandatory;
    scroll-behavior: auto; /* Will be set to smooth after initial positioning */
    -webkit-overflow-scrolling: touch;
    overscroll-behavior-x: contain;
    background-color: darkblue;
    opacity: 0; /* Hide initially to prevent flash */
    transition: opacity 0.1s ease-in;
}

.app-container.loaded {
    opacity: 1;
}

.page {
    scroll-snap-align: start;
    scroll-snap-stop: always;
    overflow-y: auto;
    overflow: hidden;
}
</style>
