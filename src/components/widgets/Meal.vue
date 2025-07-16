<template>
    <div class="meal-widget">
        <div v-if="meal" class="meal-card" :class="meal.mealType.toLowerCase()">
            <div class="meal-header">
                <h3 class="meal-name">{{ meal.name }}</h3>
                <span
                    class="meal-type-badge"
                    :class="meal.mealType.toLowerCase()"
                >
                    {{ meal.mealType }}
                </span>
            </div>

            <div class="meal-content">
                <p class="meal-description">{{ meal.description }}</p>

                <div class="meal-details">
                    <div class="detail-item">
                        <span class="detail-label">🍽️ Type:</span>
                        <span class="detail-value">{{ meal.mealType }}</span>
                    </div>

                    <div class="detail-item">
                        <span class="detail-label">🕒 Created:</span>
                        <span class="detail-value">{{
                            formatDateTime(meal.createdAt)
                        }}</span>
                    </div>
                </div>
            </div>

            <div class="meal-actions">
                <button @click="editMeal" class="action-btn primary-btn">
                    ✏️ Edit
                </button>
                <button @click="duplicateMeal" class="action-btn secondary-btn">
                    📋 Duplicate
                </button>
                <button @click="deleteMeal" class="action-btn danger-btn">
                    🗑️ Delete
                </button>
            </div>
        </div>

        <div v-else-if="error" class="error-state">
            <div class="error-icon">⚠️</div>
            <h3>Meal Not Found</h3>
            <p>{{ error }}</p>
        </div>

        <div v-else class="loading-state">
            <div class="loading-spinner"></div>
            <p>Loading meal...</p>
        </div>
    </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from "vue";
import { useMealStore, type Meal } from "../../stores/mealStore";

interface Props {
    mealId?: string;
    meal?: Meal;
}

const props = defineProps<Props>();

const mealStore = useMealStore();
const error = ref<string>("");

// Computed meal - either from props or from store
const meal = computed(() => {
    if (props.meal) {
        return props.meal;
    }

    if (props.mealId) {
        const foundMeal = mealStore.meals.find((m) => m.id === props.mealId);
        if (!foundMeal) {
            error.value = `Meal with ID "${props.mealId}" not found.`;
            return null;
        }
        return foundMeal;
    }

    error.value = "No meal ID or meal object provided.";
    return null;
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

function editMeal() {
    if (!meal.value) return;

    // In a real implementation, this would open an edit form
    // For now, we'll just log the action
    console.log("Edit meal:", meal.value);

    // You could emit an event here for the parent to handle
    // emit('edit-meal', meal.value);
}

function duplicateMeal() {
    if (!meal.value) return;

    // Create a duplicate meal using the store's addMeal method
    const duplicatedName = `${meal.value.name} (Copy)`;
    const newMealId = mealStore.addMeal(
        duplicatedName,
        meal.value.description,
        meal.value.mealType
    );

    console.log("Duplicated meal with ID:", newMealId);
}

function deleteMeal() {
    if (!meal.value) return;

    if (confirm(`Are you sure you want to delete "${meal.value.name}"?`)) {
        mealStore.deleteMeal(meal.value.id);
        console.log("Deleted meal:", meal.value.id);
    }
}

onMounted(() => {
    // Clear any previous errors when component mounts
    error.value = "";
});
</script>

<style scoped>
.meal-widget {
    max-width: 500px;
    margin: 0 auto;
}

.meal-card {
    background: white;
    border-radius: 12px;
    padding: 24px;
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
    border-left: 5px solid #666;
    transition: transform 0.2s, box-shadow 0.2s;
}

.meal-card:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
}

.meal-card.breakfast {
    border-left-color: #ffc107;
    background: linear-gradient(135deg, #fff8e1 0%, white 100%);
}

.meal-card.lunch {
    border-left-color: #28a745;
    background: linear-gradient(135deg, #e8f5e8 0%, white 100%);
}

.meal-card.dinner {
    border-left-color: #dc3545;
    background: linear-gradient(135deg, #ffeaea 0%, white 100%);
}

.meal-card.snacks {
    border-left-color: #6f42c1;
    background: linear-gradient(135deg, #f3e5f5 0%, white 100%);
}

.meal-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 16px;
}

.meal-name {
    margin: 0;
    color: #333;
    font-size: 1.5em;
    font-weight: 600;
}

.meal-type-badge {
    padding: 6px 12px;
    border-radius: 16px;
    font-size: 0.85em;
    font-weight: bold;
    color: white;
    text-transform: uppercase;
    letter-spacing: 0.5px;
}

.meal-type-badge.breakfast {
    background: linear-gradient(45deg, #ffc107, #ffb300);
}

.meal-type-badge.lunch {
    background: linear-gradient(45deg, #28a745, #20a737);
}

.meal-type-badge.dinner {
    background: linear-gradient(45deg, #dc3545, #d32535);
}

.meal-type-badge.snacks {
    background: linear-gradient(45deg, #6f42c1, #5936a3);
}

.meal-content {
    margin-bottom: 20px;
}

.meal-description {
    margin: 0 0 16px 0;
    color: #555;
    line-height: 1.6;
    font-size: 1.05em;
}

.meal-details {
    display: flex;
    flex-direction: column;
    gap: 8px;
}

.detail-item {
    display: flex;
    align-items: center;
    gap: 8px;
}

.detail-label {
    font-weight: 500;
    color: #666;
    min-width: 80px;
}

.detail-value {
    color: #333;
}

.meal-actions {
    display: flex;
    gap: 12px;
    justify-content: flex-end;
    flex-wrap: wrap;
}

.action-btn {
    padding: 10px 16px;
    border: none;
    border-radius: 6px;
    cursor: pointer;
    font-size: 0.9em;
    font-weight: 500;
    transition: all 0.2s;
    display: flex;
    align-items: center;
    gap: 6px;
}

.primary-btn {
    background: #007bff;
    color: white;
}

.primary-btn:hover {
    background: #0056b3;
    transform: translateY(-1px);
}

.secondary-btn {
    background: #6c757d;
    color: white;
}

.secondary-btn:hover {
    background: #545b62;
    transform: translateY(-1px);
}

.danger-btn {
    background: #dc3545;
    color: white;
}

.danger-btn:hover {
    background: #c82333;
    transform: translateY(-1px);
}

.error-state,
.loading-state {
    text-align: center;
    padding: 40px 20px;
    background: white;
    border-radius: 12px;
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
}

.error-icon {
    font-size: 3em;
    margin-bottom: 16px;
}

.error-state h3 {
    color: #dc3545;
    margin: 0 0 8px 0;
}

.error-state p {
    color: #666;
    margin: 0;
}

.loading-spinner {
    width: 40px;
    height: 40px;
    border: 4px solid #f3f3f3;
    border-top: 4px solid #007bff;
    border-radius: 50%;
    animation: spin 1s linear infinite;
    margin: 0 auto 16px;
}

@keyframes spin {
    0% {
        transform: rotate(0deg);
    }
    100% {
        transform: rotate(360deg);
    }
}

.loading-state p {
    color: #666;
    margin: 0;
}

@media (max-width: 600px) {
    .meal-card {
        padding: 16px;
    }

    .meal-header {
        flex-direction: column;
        gap: 12px;
        align-items: flex-start;
    }

    .meal-actions {
        justify-content: center;
    }

    .action-btn {
        flex: 1;
        justify-content: center;
    }
}
</style>
