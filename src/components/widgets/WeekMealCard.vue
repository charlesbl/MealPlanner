<template>
    <div class="week-meal-card">
        <div class="week-meal-header">
            <div 
                class="meal-type-badge"
                :style="{ backgroundColor: getMealTypeColor(meal.mealType) }"
            >
                {{ meal.mealType }}
            </div>
            <div class="week-meal-actions">
                <button
                    @click="$emit('edit', meal)"
                    class="action-btn edit-btn"
                    title="Éditer le repas"
                >
                    ✏️
                </button>
                <button
                    @click="$emit('remove', meal.weekMealId)"
                    class="action-btn remove-btn"
                    title="Retirer de la semaine"
                >
                    ❌
                </button>
            </div>
        </div>
        
        <div class="week-meal-content">
            <h4 class="meal-name">{{ meal.name }}</h4>
            <p class="meal-description" v-if="meal.description">
                {{ truncatedDescription }}
            </p>
            <p class="meal-description empty" v-else>
                Aucune description
            </p>
        </div>
        
        <div class="week-meal-footer">
            <span class="meal-order">Position #{{ meal.order + 1 }}</span>
        </div>
    </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import type { Meal } from "../../stores/mealStore";

interface WeekMealProps {
    meal: Meal & { weekMealId: string; order: number };
}

// Note: WeekMealEmits interface is defined for future use
// interface WeekMealEmits {
//     (e: "remove", weekMealId: string): void;
//     (e: "edit", meal: Meal): void;
// }

const props = defineProps<WeekMealProps>();
// Note: emit is defined but not used in this component yet
// const emit = defineEmits<WeekMealEmits>();

// Computed
const truncatedDescription = computed(() => {
    if (!props.meal.description) return "";
    const maxLength = 100;
    if (props.meal.description.length <= maxLength) {
        return props.meal.description;
    }
    return props.meal.description.substring(0, maxLength) + "...";
});

// Methods
function getMealTypeColor(mealType: string): string {
    const colors: Record<string, string> = {
        Breakfast: "#FF9800",
        Lunch: "#2196F3", 
        Dinner: "#4CAF50",
        Snacks: "#9C27B0",
    };
    return colors[mealType] || "#757575";
}
</script>

<style scoped>
.week-meal-card {
    background: white;
    border: 1px solid #e0e0e0;
    border-radius: 6px;
    overflow: hidden;
    transition: box-shadow 0.2s, transform 0.2s;
    display: flex;
    flex-direction: column;
    height: 100%;
}

.week-meal-card:hover {
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
    transform: translateY(-1px);
}

.week-meal-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 12px;
    background: #f8f9fa;
    border-bottom: 1px solid #e0e0e0;
}

.meal-type-badge {
    color: white;
    padding: 4px 8px;
    border-radius: 10px;
    font-size: 0.75rem;
    font-weight: 500;
    text-transform: uppercase;
    letter-spacing: 0.5px;
}

.week-meal-actions {
    display: flex;
    gap: 4px;
}

.action-btn {
    background: none;
    border: none;
    cursor: pointer;
    padding: 4px;
    border-radius: 3px;
    font-size: 0.9rem;
    transition: background-color 0.2s;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 24px;
    height: 24px;
}

.action-btn:hover {
    background-color: rgba(0, 0, 0, 0.1);
}

.edit-btn:hover {
    background-color: #e3f2fd;
}

.remove-btn:hover {
    background-color: #ffebee;
}

.week-meal-content {
    flex: 1;
    padding: 12px;
}

.meal-name {
    margin: 0 0 8px 0;
    font-size: 1rem;
    font-weight: 600;
    color: #333;
    line-height: 1.3;
}

.meal-description {
    margin: 0;
    color: #666;
    font-size: 0.85rem;
    line-height: 1.4;
}

.meal-description.empty {
    font-style: italic;
    color: #999;
}

.week-meal-footer {
    padding: 8px 12px;
    background: #f8f9fa;
    border-top: 1px solid #e0e0e0;
}

.meal-order {
    font-size: 0.75rem;
    color: #666;
    font-weight: 500;
}

/* Responsive */
@media (max-width: 480px) {
    .week-meal-header {
        padding: 10px;
    }
    
    .week-meal-content {
        padding: 10px;
    }
    
    .meal-name {
        font-size: 0.95rem;
    }
    
    .meal-description {
        font-size: 0.8rem;
    }
}
</style>
