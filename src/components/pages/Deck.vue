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
    background-color: blue;
}
</style>
