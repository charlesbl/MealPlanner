<template>
    <div class="week-view-widget">
        <div class="week-header">
            <h3 class="week-title">Ma Sélection de la Semaine</h3>
            
            <div class="week-controls">
                <button @click="generateWeek" class="generate-btn">
                    🎲 Générer une sélection
                </button>
                <button @click="clearWeek" class="clear-btn" :disabled="selectedMeals.length === 0">
                    🗑️ Vider
                </button>
            </div>
        </div>

        <!-- Week Statistics -->
        <div v-if="selectedMeals.length > 0" class="week-stats">
            <div class="stat-item">
                <span class="stat-label">Total :</span>
                <span class="stat-value">{{ selectedMeals.length }} repas</span>
            </div>
            <div class="stat-breakdown">
                <div 
                    v-for="(count, type) in mealTypeBreakdown" 
                    :key="type"
                    class="type-stat"
                    :class="type.toLowerCase()"
                >
                    <span class="type-icon">{{ getMealTypeIcon(type) }}</span>
                    <span class="type-name">{{ type }}</span>
                    <span class="type-count">{{ count }}</span>
                </div>
            </div>
        </div>

        <!-- Selected Meals -->
        <div class="selected-meals-container">
            <div v-if="selectedMeals.length === 0" class="empty-week">
                <div class="empty-icon">🍽️</div>
                <h4>Aucun repas sélectionné</h4>
                <p>Ajoutez des repas depuis votre deck ou générez une sélection automatique.</p>
                <button @click="$emit('show-deck')" class="show-deck-btn">
                    📚 Voir mon deck
                </button>
            </div>
            
            <div v-else class="week-meals">
                <div class="meals-by-type" v-if="groupByType">
                    <div 
                        v-for="(meals, type) in selectedMealsByType" 
                        :key="type"
                        class="type-group"
                    >
                        <h4 class="type-header">
                            <span class="type-icon">{{ getMealTypeIcon(type) }}</span>
                            {{ type }} ({{ meals?.length || 0 }})
                        </h4>
                        <div class="type-meals">
                            <WeekMealCard
                                v-for="meal in meals"
                                :key="meal.weekMealId"
                                :meal="meal"
                                @remove="removeMealFromWeek"
                                @edit="editMeal"
                            />
                        </div>
                    </div>
                </div>
                
                <div v-else class="meals-list">
                    <WeekMealCard
                        v-for="meal in selectedMeals"
                        :key="meal.weekMealId"
                        :meal="meal"
                        @remove="removeMealFromWeek"
                        @edit="editMeal"
                    />
                </div>
                
                <!-- View Toggle -->
                <div class="view-controls">
                    <button 
                        @click="groupByType = !groupByType" 
                        class="toggle-view-btn"
                    >
                        {{ groupByType ? '📋 Vue liste' : '🏷️ Grouper par type' }}
                    </button>
                </div>
            </div>
        </div>

        <!-- Generation Modal -->
        <div v-if="showGenerationModal" class="modal-overlay" @click="closeGenerationModal">
            <div class="modal-content" @click.stop>
                <h3>Générer une sélection automatique</h3>
                
                <div class="generation-form">
                    <div class="form-group">
                        <label for="totalMeals">Nombre total de repas :</label>
                        <input 
                            id="totalMeals"
                            v-model.number="generationSettings.totalMeals" 
                            type="number" 
                            min="1" 
                            max="21"
                            class="form-input"
                        />
                    </div>
                    
                    <div class="form-group">
                        <label>
                            <input 
                                v-model="generationSettings.useDistribution" 
                                type="checkbox"
                            /> 
                            Répartition par type de repas
                        </label>
                    </div>
                    
                    <div v-if="generationSettings.useDistribution" class="distribution-settings">
                        <div 
                            v-for="type in mealTypes" 
                            :key="type"
                            class="distribution-item"
                        >
                            <label :for="`dist-${type}`">{{ type }} :</label>
                            <input 
                                :id="`dist-${type}`"
                                v-model.number="generationSettings.distribution[type]" 
                                type="number" 
                                min="0"
                                class="form-input small"
                            />
                        </div>
                        <div class="distribution-total">
                            Total : {{ distributionTotal }}
                        </div>
                    </div>
                </div>
                
                <div class="modal-actions">
                    <button @click="confirmGeneration" class="confirm-btn">
                        Générer
                    </button>
                    <button @click="closeGenerationModal" class="cancel-btn">
                        Annuler
                    </button>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { computed, ref } from "vue";
import { useWeekStore } from "../../stores/weekStore";
import { useMealStore, MealType, type Meal } from "../../stores/mealStore";
import WeekMealCard from "./WeekMealCard.vue";

// Emits
interface Emits {
    (e: "show-deck"): void;
    (e: "edit-meal", meal: Meal): void;
}

const emit = defineEmits<Emits>();

const weekStore = useWeekStore();
const mealStore = useMealStore();

// State
const groupByType = ref(false);
const showGenerationModal = ref(false);
const generationSettings = ref({
    totalMeals: 7,
    useDistribution: false,
    distribution: {
        [MealType.Breakfast]: 2,
        [MealType.Lunch]: 2,
        [MealType.Dinner]: 2,
        [MealType.Snacks]: 1,
    }
});

// Computed
const selectedMeals = computed(() => weekStore.getSelectedMealsWithData());

const selectedMealsByType = computed(() => weekStore.selectedMealsByType());

const mealTypeBreakdown = computed(() => {
    const breakdown: Record<string, number> = {};
    selectedMeals.value.forEach(meal => {
        breakdown[meal.mealType] = (breakdown[meal.mealType] || 0) + 1;
    });
    return breakdown;
});

const mealTypes = Object.values(MealType);

const distributionTotal = computed(() => {
    if (!generationSettings.value.useDistribution) return 0;
    return Object.values(generationSettings.value.distribution).reduce((sum, count) => sum + (count || 0), 0);
});

// Methods
function getMealTypeIcon(mealType: string): string {
    const icons: Record<string, string> = {
        [MealType.Breakfast]: "🌅",
        [MealType.Lunch]: "☀️",
        [MealType.Dinner]: "🌙",
        [MealType.Snacks]: "🍿",
    };
    return icons[mealType] || "🍽️";
}

function generateWeek() {
    const totalMeals = mealStore.getAllMeals().length;
    if (totalMeals === 0) {
        alert("Vous devez d'abord créer des repas dans votre deck !");
        return;
    }
    
    showGenerationModal.value = true;
}

function confirmGeneration() {
    if (generationSettings.value.useDistribution) {
        weekStore.generateWeekSelection(
            generationSettings.value.totalMeals,
            generationSettings.value.distribution
        );
    } else {
        weekStore.generateWeekSelection(generationSettings.value.totalMeals);
    }
    
    closeGenerationModal();
}

function clearWeek() {
    if (confirm("Êtes-vous sûr de vouloir vider votre sélection de la semaine ?")) {
        weekStore.clearWeek();
    }
}

function removeMealFromWeek(weekMealId: string) {
    weekStore.removeWeekMealById(weekMealId);
}

function editMeal(meal: Meal) {
    emit("edit-meal", meal);
}

function closeGenerationModal() {
    showGenerationModal.value = false;
}
</script>

<style scoped>
.week-view-widget {
    background: white;
    border-radius: 8px;
    padding: 20px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    margin-bottom: 20px;
}

.week-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
    flex-wrap: wrap;
    gap: 10px;
}

.week-title {
    margin: 0;
    font-size: 1.5em;
    color: #333;
}

.week-controls {
    display: flex;
    gap: 10px;
}

.generate-btn {
    background: #007bff;
    color: white;
    border: none;
    padding: 8px 16px;
    border-radius: 4px;
    cursor: pointer;
    font-size: 14px;
}

.generate-btn:hover {
    background: #0056b3;
}

.clear-btn {
    background: #dc3545;
    color: white;
    border: none;
    padding: 8px 16px;
    border-radius: 4px;
    cursor: pointer;
    font-size: 14px;
}

.clear-btn:hover:not(:disabled) {
    background: #c82333;
}

.clear-btn:disabled {
    background: #ccc;
    cursor: not-allowed;
}

/* Statistics */
.week-stats {
    background: #f8f9fa;
    border-radius: 6px;
    padding: 15px;
    margin-bottom: 20px;
}

.stat-item {
    display: flex;
    justify-content: space-between;
    margin-bottom: 10px;
}

.stat-label {
    font-weight: 500;
    color: #666;
}

.stat-value {
    font-weight: 600;
    color: #333;
}

.stat-breakdown {
    display: flex;
    gap: 15px;
    flex-wrap: wrap;
}

.type-stat {
    display: flex;
    align-items: center;
    gap: 5px;
    padding: 4px 8px;
    border-radius: 4px;
    font-size: 14px;
}

.type-stat.breakfast { background: #fff8e1; }
.type-stat.lunch { background: #e8f5e8; }
.type-stat.dinner { background: #ffeaea; }
.type-stat.snacks { background: #f3e5f5; }

.type-count {
    font-weight: 600;
}

/* Empty State */
.empty-week {
    text-align: center;
    padding: 40px 20px;
    color: #666;
}

.empty-icon {
    font-size: 3em;
    margin-bottom: 15px;
}

.empty-week h4 {
    margin: 0 0 10px 0;
    color: #333;
}

.empty-week p {
    margin: 0 0 20px 0;
    line-height: 1.5;
}

.show-deck-btn {
    background: #28a745;
    color: white;
    border: none;
    padding: 10px 20px;
    border-radius: 4px;
    cursor: pointer;
    font-size: 14px;
}

.show-deck-btn:hover {
    background: #218838;
}

/* Meals Display */
.meals-by-type {
    display: flex;
    flex-direction: column;
    gap: 20px;
}

.type-group {
    border: 1px solid #e0e0e0;
    border-radius: 6px;
    overflow: hidden;
}

.type-header {
    background: #f8f9fa;
    margin: 0;
    padding: 12px 15px;
    font-size: 1.1em;
    display: flex;
    align-items: center;
    gap: 8px;
    border-bottom: 1px solid #e0e0e0;
}

.type-meals {
    padding: 15px;
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
    gap: 15px;
}

.meals-list {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
    gap: 20px;
}

.view-controls {
    margin-top: 20px;
    text-align: center;
    padding-top: 20px;
    border-top: 1px solid #e0e0e0;
}

.toggle-view-btn {
    background: #6c757d;
    color: white;
    border: none;
    padding: 8px 16px;
    border-radius: 4px;
    cursor: pointer;
    font-size: 14px;
}

.toggle-view-btn:hover {
    background: #5a6268;
}

/* Modal */
.modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.5);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 1000;
}

.modal-content {
    background: white;
    border-radius: 8px;
    padding: 20px;
    max-width: 400px;
    width: 90%;
}

.modal-content h3 {
    margin: 0 0 20px 0;
    color: #333;
}

.generation-form {
    margin-bottom: 20px;
}

.form-group {
    margin-bottom: 15px;
}

.form-group label {
    display: block;
    margin-bottom: 5px;
    font-weight: 500;
    color: #333;
}

.form-input {
    width: 100%;
    padding: 8px 12px;
    border: 1px solid #ddd;
    border-radius: 4px;
    font-size: 14px;
}

.form-input.small {
    width: 60px;
}

.distribution-settings {
    background: #f8f9fa;
    padding: 15px;
    border-radius: 4px;
    margin-top: 10px;
}

.distribution-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 10px;
}

.distribution-total {
    text-align: center;
    margin-top: 10px;
    font-weight: 600;
    color: #333;
}

.modal-actions {
    display: flex;
    gap: 10px;
    justify-content: flex-end;
}

.confirm-btn {
    background: #007bff;
    color: white;
    border: none;
    padding: 10px 20px;
    border-radius: 4px;
    cursor: pointer;
}

.confirm-btn:hover {
    background: #0056b3;
}

.cancel-btn {
    background: #6c757d;
    color: white;
    border: none;
    padding: 10px 20px;
    border-radius: 4px;
    cursor: pointer;
}

.cancel-btn:hover {
    background: #5a6268;
}

/* Responsive */
@media (max-width: 768px) {
    .week-header {
        flex-direction: column;
        align-items: stretch;
    }
    
    .week-controls {
        justify-content: center;
    }
    
    .stat-breakdown {
        justify-content: center;
    }
    
    .type-meals,
    .meals-list {
        grid-template-columns: 1fr;
    }
}
</style>
