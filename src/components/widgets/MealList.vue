<template>
    <div class="meal-list-widget">
        <div class="widget-header">
            <h3>{{ title }}</h3>
            <div class="filters">
                <select v-model="selectedMealType" class="filter-select">
                    <option value="">All Meal Types</option>
                    <option v-for="type in mealTypes" :key="type" :value="type">
                        {{ type }}
                    </option>
                </select>
                <input
                    type="date"
                    v-model="selectedDate"
                    class="date-filter"
                    placeholder="Filter by date"
                />
            </div>
        </div>

        <div class="meal-list">
            <div v-if="filteredMeals.length === 0" class="no-meals">
                <p>No meals found for the selected criteria.</p>
            </div>

            <div
                v-for="meal in filteredMeals"
                :key="meal.id"
                class="meal-item"
                :class="meal.mealType.toLowerCase()"
            >
                <div class="meal-header">
                    <h4 class="meal-name">{{ meal.name }}</h4>
                    <span
                        class="meal-type-badge"
                        :class="meal.mealType.toLowerCase()"
                    >
                        {{ meal.mealType }}
                    </span>
                </div>

                <p class="meal-description">{{ meal.description }}</p>

                <div class="meal-meta">
                    <span class="meal-type">
                        🍽️ {{ meal.mealType }}
                    </span>
                    <span class="meal-created">
                        Created: {{ formatDateTime(meal.createdAt) }}
                    </span>
                </div>

                <div class="meal-actions">
                    <button
                        @click="editMeal(meal)"
                        class="action-btn edit-btn"
                        title="Edit meal"
                    >
                        ✏️
                    </button>
                    <button
                        @click="deleteMeal(meal.id)"
                        class="action-btn delete-btn"
                        title="Delete meal"
                    >
                        🗑️
                    </button>
                </div>
            </div>
        </div>

        <div v-if="showPagination" class="pagination">
            <button
                @click="currentPage--"
                :disabled="currentPage <= 1"
                class="page-btn"
            >
                Previous
            </button>
            <span class="page-info">
                Page {{ currentPage }} of {{ totalPages }}
            </span>
            <button
                @click="currentPage++"
                :disabled="currentPage >= totalPages"
                class="page-btn"
            >
                Next
            </button>
        </div>
    </div>
</template>

<script setup lang="ts">
import { computed, ref } from "vue";
import { MealType, useMealStore, type Meal } from "../../stores/mealStore";

interface Props {
    title?: string;
    mealType?: MealType;
    date?: string;
    limit?: number;
    showFilters?: boolean;
    showPagination?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
    title: "Meal List",
    showFilters: true,
    showPagination: true,
    limit: 10,
});

const mealStore = useMealStore();

// Component state
const selectedMealType = ref(props.mealType || "");
const selectedDate = ref(props.date || "");
const currentPage = ref(1);

// Computed properties
const mealTypes = computed(() => Object.values(MealType));

const filteredMeals = computed(() => {
    let meals = mealStore.meals;

    // Filter by meal type
    if (selectedMealType.value) {
        meals = meals.filter(
            (meal) => meal.mealType === selectedMealType.value
        );
    }

    // Filter by date
    // Sort by creation date (newest first)
    meals = meals.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

    // Pagination
    if (props.showPagination) {
        const startIndex = (currentPage.value - 1) * props.limit;
        const endIndex = startIndex + props.limit;
        return meals.slice(startIndex, endIndex);
    }

    return meals;
});

const totalPages = computed(() => {
    if (!props.showPagination) return 1;

    let totalMeals = mealStore.meals;

    if (selectedMealType.value) {
        totalMeals = totalMeals.filter(
            (meal) => meal.mealType === selectedMealType.value
        );
    }

    return Math.ceil(totalMeals.length / props.limit);
});

// Methods
function formatDateTime(date: Date): string {
    return date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
    });
}

function editMeal(meal: Meal) {
    // Emit event for parent to handle
    // In a real implementation, this could open an edit form
    console.log("Edit meal:", meal);
}

function deleteMeal(mealId: string) {
    if (confirm("Are you sure you want to delete this meal?")) {
        mealStore.deleteMeal(mealId);
    }
}
</script>

<style scoped>
.meal-list-widget {
    background: white;
    border-radius: 8px;
    padding: 20px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    margin-bottom: 20px;
}

.widget-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
    flex-wrap: wrap;
    gap: 10px;
}

.widget-header h3 {
    margin: 0;
    color: #333;
}

.filters {
    display: flex;
    gap: 10px;
    flex-wrap: wrap;
}

.filter-select,
.date-filter {
    padding: 6px 10px;
    border: 1px solid #ddd;
    border-radius: 4px;
    font-size: 0.9em;
}

.meal-list {
    display: flex;
    flex-direction: column;
    gap: 16px;
}

.no-meals {
    text-align: center;
    padding: 40px 20px;
    color: #666;
}

.meal-item {
    border: 1px solid #e0e0e0;
    border-radius: 8px;
    padding: 16px;
    position: relative;
    border-left: 4px solid #666;
    transition: transform 0.2s, box-shadow 0.2s;
}

.meal-item:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.meal-item.breakfast {
    border-left-color: #ffc107;
    background: linear-gradient(to right, #fff8e1, white);
}

.meal-item.lunch {
    border-left-color: #28a745;
    background: linear-gradient(to right, #e8f5e8, white);
}

.meal-item.dinner {
    border-left-color: #dc3545;
    background: linear-gradient(to right, #ffeaea, white);
}

.meal-item.snacks {
    border-left-color: #6f42c1;
    background: linear-gradient(to right, #f3e5f5, white);
}

.meal-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 8px;
}

.meal-name {
    margin: 0;
    color: #333;
    font-size: 1.1em;
}

.meal-type-badge {
    padding: 4px 8px;
    border-radius: 12px;
    font-size: 0.8em;
    font-weight: bold;
    color: white;
}

.meal-type-badge.breakfast {
    background: #ffc107;
}

.meal-type-badge.lunch {
    background: #28a745;
}

.meal-type-badge.dinner {
    background: #dc3545;
}

.meal-type-badge.snacks {
    background: #6f42c1;
}

.meal-description {
    margin: 0 0 12px 0;
    color: #666;
    line-height: 1.4;
}

.meal-meta {
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-size: 0.85em;
    color: #888;
    margin-bottom: 12px;
}

.meal-actions {
    display: flex;
    gap: 8px;
    justify-content: flex-end;
}

.action-btn {
    background: none;
    border: 1px solid #ddd;
    padding: 6px 8px;
    border-radius: 4px;
    cursor: pointer;
    font-size: 0.9em;
    transition: all 0.2s;
}

.action-btn:hover {
    background: #f5f5f5;
}

.edit-btn:hover {
    background: #e3f2fd;
    border-color: #2196f3;
}

.delete-btn:hover {
    background: #ffebee;
    border-color: #f44336;
}

.pagination {
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 16px;
    margin-top: 20px;
    padding-top: 20px;
    border-top: 1px solid #e0e0e0;
}

.page-btn {
    padding: 8px 16px;
    border: 1px solid #ddd;
    background: white;
    border-radius: 4px;
    cursor: pointer;
    transition: all 0.2s;
}

.page-btn:hover:not(:disabled) {
    background: #007bff;
    color: white;
    border-color: #007bff;
}

.page-btn:disabled {
    opacity: 0.5;
    cursor: not-allowed;
}

.page-info {
    font-size: 0.9em;
    color: #666;
}
</style>
