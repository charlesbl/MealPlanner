<script lang="ts" setup>
import MealCard from "../MealCard.vue";
</script>

<template>
    <div class="week-container">
        WEEK
        <div>
            <MealCard />
            <MealCard />
            <MealCard />
            <MealCard />
        </div>
    </div>
</template>

<style scoped>
.week-container {
    background-color: var(--bg-primary);
    color: var(--text-primary);
    height: 100%;
    padding: 16px;
}
</style>
