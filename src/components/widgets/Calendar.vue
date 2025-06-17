<template>
    <div class="calendar-widget">
        <div class="calendar-header">
            <button @click="previousMonth" class="nav-button">&lt;</button>
            <h3 class="month-title">{{ monthTitle }}</h3>
            <button @click="nextMonth" class="nav-button">&gt;</button>
        </div>

        <div class="calendar-grid">
            <div class="day-header" v-for="day in dayHeaders" :key="day">
                {{ day }}
            </div>

            <div
                v-for="date in calendarDates"
                :key="`${date.year}-${date.month}-${date.day}`"
                class="calendar-day"
                :class="{
                    'other-month': !date.isCurrentMonth,
                    today: date.isToday,
                    'has-meals': date.hasMeals,
                    selected: isSelected(date),
                }"
                @click="selectDate(date)"
            >
                <div class="day-number">{{ date.day }}</div>
                <div v-if="date.hasMeals" class="meal-indicators">
                    <div
                        v-for="mealType in date.mealTypes"
                        :key="mealType"
                        class="meal-dot"
                        :class="mealType.toLowerCase()"
                        :title="mealType"
                    ></div>
                </div>
            </div>
        </div>

        <div v-if="selectedDateMeals.length > 0" class="selected-date-meals">
            <h4>Meals for {{ formatSelectedDate }}</h4>
            <div class="meal-list">
                <div
                    v-for="meal in selectedDateMeals"
                    :key="meal.id"
                    class="meal-item"
                    :class="meal.mealType.toLowerCase()"
                >
                    <strong>{{ meal.mealType }}:</strong> {{ meal.name }}
                    <p class="meal-description">{{ meal.description }}</p>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { computed, ref } from "vue";
import { useMealStore } from "../../stores/mealStore";

const mealStore = useMealStore();

// Calendar state
const currentDate = ref(new Date());
const selectedDate = ref<Date | null>(null);

// Day headers
const dayHeaders = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

// Computed properties
const monthTitle = computed(() => {
    return currentDate.value.toLocaleDateString("en-US", {
        month: "long",
        year: "numeric",
    });
});

const formatSelectedDate = computed(() => {
    if (!selectedDate.value) return "";
    return selectedDate.value.toLocaleDateString("en-US", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
    });
});

const calendarDates = computed(() => {
    const year = currentDate.value.getFullYear();
    const month = currentDate.value.getMonth();

    // First day of the month
    const firstDay = new Date(year, month, 1);

    // Start from the Sunday of the week containing the first day
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - startDate.getDay());

    // Generate 42 days (6 weeks)
    const dates = [];
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    for (let i = 0; i < 42; i++) {
        const date = new Date(startDate);
        date.setDate(startDate.getDate() + i);

        const dateString = date.toISOString().split("T")[0];
        const dayMeals = mealStore.getMealsByDate(dateString);

        dates.push({
            date: new Date(date),
            day: date.getDate(),
            month: date.getMonth(),
            year: date.getFullYear(),
            isCurrentMonth: date.getMonth() === month,
            isToday: date.getTime() === today.getTime(),
            hasMeals: dayMeals.length > 0,
            mealTypes: [...new Set(dayMeals.map((meal) => meal.mealType))],
        });
    }

    return dates;
});

const selectedDateMeals = computed(() => {
    if (!selectedDate.value) return [];
    const dateString = selectedDate.value.toISOString().split("T")[0];
    return mealStore.getMealsByDate(dateString);
});

// Methods
function previousMonth() {
    currentDate.value = new Date(
        currentDate.value.getFullYear(),
        currentDate.value.getMonth() - 1,
        1
    );
}

function nextMonth() {
    currentDate.value = new Date(
        currentDate.value.getFullYear(),
        currentDate.value.getMonth() + 1,
        1
    );
}

function selectDate(dateInfo: any) {
    selectedDate.value = dateInfo.date;
}

function isSelected(dateInfo: any): boolean {
    if (!selectedDate.value) return false;
    return dateInfo.date.getTime() === selectedDate.value.getTime();
}
</script>

<style scoped>
.calendar-widget {
    background: white;
    border-radius: 8px;
    padding: 20px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    margin-bottom: 20px;
}

.calendar-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
}

.nav-button {
    background: #007bff;
    color: white;
    border: none;
    padding: 8px 12px;
    border-radius: 4px;
    cursor: pointer;
    font-size: 16px;
}

.nav-button:hover {
    background: #0056b3;
}

.month-title {
    margin: 0;
    font-size: 1.5em;
    color: #333;
}

.calendar-grid {
    display: grid;
    grid-template-columns: repeat(7, 1fr);
    gap: 1px;
    background: #e0e0e0;
    border-radius: 4px;
    overflow: hidden;
}

.day-header {
    background: #f8f9fa;
    padding: 10px 5px;
    text-align: center;
    font-weight: bold;
    color: #666;
    font-size: 0.9em;
}

.calendar-day {
    background: white;
    min-height: 60px;
    padding: 5px;
    cursor: pointer;
    position: relative;
    display: flex;
    flex-direction: column;
    align-items: center;
}

.calendar-day:hover {
    background: #f0f8ff;
}

.calendar-day.other-month {
    background: #f8f9fa;
    color: #999;
}

.calendar-day.today {
    background: #e3f2fd;
    color: #1976d2;
    font-weight: bold;
}

.calendar-day.selected {
    background: #007bff;
    color: white;
}

.calendar-day.has-meals {
    border-left: 3px solid #28a745;
}

.day-number {
    font-size: 0.9em;
    margin-bottom: 2px;
}

.meal-indicators {
    display: flex;
    gap: 2px;
    flex-wrap: wrap;
}

.meal-dot {
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: #666;
}

.meal-dot.breakfast {
    background: #ffc107;
}

.meal-dot.lunch {
    background: #28a745;
}

.meal-dot.dinner {
    background: #dc3545;
}

.meal-dot.snacks {
    background: #6f42c1;
}

.selected-date-meals {
    margin-top: 20px;
    padding-top: 20px;
    border-top: 1px solid #e0e0e0;
}

.selected-date-meals h4 {
    margin: 0 0 10px 0;
    color: #333;
}

.meal-list {
    display: flex;
    flex-direction: column;
    gap: 8px;
}

.meal-item {
    padding: 8px 12px;
    border-radius: 4px;
    border-left: 4px solid #666;
}

.meal-item.breakfast {
    background: #fff8e1;
    border-left-color: #ffc107;
}

.meal-item.lunch {
    background: #e8f5e8;
    border-left-color: #28a745;
}

.meal-item.dinner {
    background: #ffeaea;
    border-left-color: #dc3545;
}

.meal-item.snacks {
    background: #f3e5f5;
    border-left-color: #6f42c1;
}

.meal-description {
    margin: 4px 0 0 0;
    font-size: 0.9em;
    color: #666;
}
</style>
