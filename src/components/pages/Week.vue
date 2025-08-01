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
    background-color: red;
}
</style>
