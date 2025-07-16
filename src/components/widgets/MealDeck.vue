<template>
    <div class="meal-deck-widget">
        <div class="meal-deck-header">
            <h3 class="deck-title">Mon Deck de Repas</h3>
            
            <!-- Search and Filters -->
            <div class="deck-controls">
                <div class="search-container">
                    <input
                        v-model="searchQuery"
                        type="text"
                        placeholder="Rechercher un repas..."
                        class="search-input"
                    />
                    <span class="search-icon">🔍</span>
                </div>
                
                <div class="filter-container">
                    <select v-model="selectedMealType" class="meal-type-filter">
                        <option value="">Tous les types</option>
                        <option v-for="type in mealTypes" :key="type" :value="type">
                            {{ type }}
                        </option>
                    </select>
                </div>
                
                <button @click="showAddForm = true" class="add-meal-btn">
                    ➕ Nouveau Repas
                </button>
            </div>
        </div>

        <!-- Meal Cards Grid -->
        <div class="meal-cards-container">
            <div v-if="filteredMeals.length === 0" class="empty-state">
                <p v-if="allMeals.length === 0">
                    Aucun repas dans votre deck. Commencez par créer votre premier repas !
                </p>
                <p v-else>
                    Aucun repas ne correspond à vos critères de recherche.
                </p>
            </div>
            
            <div v-else class="meal-cards-grid">
                <MealCard
                    v-for="meal in paginatedMeals"
                    :key="meal.id"
                    :meal="meal"
                    :is-in-week="weekStore.isMealInWeek(meal.id)"
                    @edit="editMeal"
                    @delete="deleteMeal"
                    @add-to-week="addToWeek"
                    @remove-from-week="removeFromWeek"
                />
            </div>
            
            <!-- Pagination -->
            <div v-if="totalPages > 1" class="pagination">
                <button 
                    @click="currentPage--" 
                    :disabled="currentPage === 1"
                    class="pagination-btn"
                >
                    ⬅️ Précédent
                </button>
                
                <span class="pagination-info">
                    Page {{ currentPage }} sur {{ totalPages }}
                    ({{ filteredMeals.length }} repas)
                </span>
                
                <button 
                    @click="currentPage++" 
                    :disabled="currentPage === totalPages"
                    class="pagination-btn"
                >
                    Suivant ➡️
                </button>
            </div>
        </div>

        <!-- Add/Edit Meal Form Modal -->
        <div v-if="showAddForm || editingMeal" class="modal-overlay" @click="closeForm">
            <div class="modal-content" @click.stop>
                <AddMealForm
                    :meal="editingMeal"
                    @save="saveMeal"
                    @cancel="closeForm"
                />
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from "vue";
import { useMealStore, type Meal, MealType } from "../../stores/mealStore";
import { useWeekStore } from "../../stores/weekStore";
import MealCard from "../MealCard.vue";
import AddMealForm from "../AddMealForm.vue";

const mealStore = useMealStore();
const weekStore = useWeekStore();

// State
const searchQuery = ref("");
const selectedMealType = ref("");
const currentPage = ref(1);
const mealsPerPage = 12;
const showAddForm = ref(false);
const editingMeal = ref<Meal | null>(null);

// Meal types for filter
const mealTypes = Object.values(MealType);

// Get all meals
const allMeals = computed(() => mealStore.getAllMeals());

// Filtered meals based on search and type
const filteredMeals = computed(() => {
    let meals = allMeals.value;
    
    // Filter by search query
    if (searchQuery.value.trim()) {
        const query = searchQuery.value.toLowerCase().trim();
        meals = meals.filter(meal => 
            meal.name.toLowerCase().includes(query) ||
            meal.description.toLowerCase().includes(query)
        );
    }
    
    // Filter by meal type
    if (selectedMealType.value) {
        meals = meals.filter(meal => meal.mealType === selectedMealType.value);
    }
    
    return meals;
});

// Pagination
const totalPages = computed(() => Math.ceil(filteredMeals.value.length / mealsPerPage));

const paginatedMeals = computed(() => {
    const start = (currentPage.value - 1) * mealsPerPage;
    const end = start + mealsPerPage;
    return filteredMeals.value.slice(start, end);
});

// Reset pagination when filters change
watch([searchQuery, selectedMealType], () => {
    currentPage.value = 1;
});

// Methods
function editMeal(meal: Meal) {
    editingMeal.value = meal;
}

function deleteMeal(meal: Meal) {
    if (confirm(`Êtes-vous sûr de vouloir supprimer "${meal.name}" ?`)) {
        mealStore.deleteMeal(meal.id);
        
        // Remove from week if it was selected
        if (weekStore.isMealInWeek(meal.id)) {
            weekStore.removeMealFromWeek(meal.id);
        }
    }
}

function addToWeek(meal: Meal) {
    weekStore.addMealToWeek(meal.id);
}

function removeFromWeek(meal: Meal) {
    weekStore.removeMealFromWeek(meal.id);
}

function saveMeal(mealData: { name: string; description: string; mealType: MealType }) {
    if (editingMeal.value) {
        // Update existing meal
        mealStore.updateMeal(editingMeal.value.id, mealData);
    } else {
        // Add new meal
        mealStore.addMeal(mealData.name, mealData.description, mealData.mealType);
    }
    closeForm();
}

function closeForm() {
    showAddForm.value = false;
    editingMeal.value = null;
}
</script>

<style scoped>
.meal-deck-widget {
    background: white;
    border-radius: 8px;
    padding: 20px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    margin-bottom: 20px;
}

.meal-deck-header {
    margin-bottom: 20px;
}

.deck-title {
    margin: 0 0 15px 0;
    font-size: 1.5em;
    color: #333;
}

.deck-controls {
    display: flex;
    gap: 15px;
    align-items: center;
    flex-wrap: wrap;
}

.search-container {
    position: relative;
    flex: 1;
    min-width: 200px;
}

.search-input {
    width: 100%;
    padding: 8px 35px 8px 12px;
    border: 1px solid #ddd;
    border-radius: 4px;
    font-size: 14px;
}

.search-input:focus {
    outline: none;
    border-color: #007bff;
    box-shadow: 0 0 0 2px rgba(0, 123, 255, 0.25);
}

.search-icon {
    position: absolute;
    right: 10px;
    top: 50%;
    transform: translateY(-50%);
    color: #666;
}

.filter-container {
    min-width: 150px;
}

.meal-type-filter {
    width: 100%;
    padding: 8px 12px;
    border: 1px solid #ddd;
    border-radius: 4px;
    font-size: 14px;
    background: white;
}

.add-meal-btn {
    padding: 8px 16px;
    background: #28a745;
    color: white;
    border: none;
    border-radius: 4px;
    font-size: 14px;
    cursor: pointer;
    white-space: nowrap;
}

.add-meal-btn:hover {
    background: #218838;
}

.meal-cards-container {
    min-height: 400px;
}

.empty-state {
    text-align: center;
    padding: 40px 20px;
    color: #666;
}

.empty-state p {
    font-size: 16px;
    margin: 0;
}

.meal-cards-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
    gap: 20px;
    margin-bottom: 20px;
}

.pagination {
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 15px;
    margin-top: 20px;
    padding: 15px 0;
    border-top: 1px solid #e0e0e0;
}

.pagination-btn {
    padding: 8px 16px;
    background: #007bff;
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    font-size: 14px;
}

.pagination-btn:hover:not(:disabled) {
    background: #0056b3;
}

.pagination-btn:disabled {
    background: #ccc;
    cursor: not-allowed;
}

.pagination-info {
    color: #666;
    font-size: 14px;
}

/* Modal Styles */
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
    max-width: 500px;
    width: 90%;
    max-height: 90vh;
    overflow-y: auto;
}

/* Responsive */
@media (max-width: 768px) {
    .deck-controls {
        flex-direction: column;
        align-items: stretch;
    }
    
    .search-container,
    .filter-container {
        min-width: auto;
    }
    
    .meal-cards-grid {
        grid-template-columns: 1fr;
    }
    
    .pagination {
        flex-direction: column;
        gap: 10px;
    }
}
</style>
