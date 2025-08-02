<script lang="ts" setup>
import MealCard from "../MealCard.vue";
</script>

<template>
    <div class="deck-container">
        DECK
        <div>
            <MealCard />
            <MealCard />
            <MealCard />
            <MealCard />
        </div>
    </div>
</template>

<style scoped>
.deck-container {
    background-color: var(--bg-primary);
    color: var(--text-primary);
    height: 100%;
    padding: 16px;
}
</style>
