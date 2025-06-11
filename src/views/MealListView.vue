<script setup lang="ts">
import { ref, computed } from 'vue';
import { useMealStore, type Meal, MealType } from '@/stores/mealStore';
import MealCard from '@/components/MealCard.vue';
import AddMealForm from '@/components/AddMealForm.vue';

const mealStore = useMealStore();

// Form state
const showAddForm = ref(false);
const editingMeal = ref<Meal | null>(null);

// Filter state
const selectedMealType = ref<MealType | 'All'>('All');

// Computed properties
const filteredMeals = computed(() => {
  const allMeals = mealStore.getAllMeals();
  if (selectedMealType.value === 'All') {
    return allMeals;
  }
  return allMeals.filter(meal => meal.mealType === selectedMealType.value);
});

const mealTypeOptions = computed(() => [
  { value: 'All', label: 'All Meals' },
  ...Object.values(MealType).map(type => ({ value: type, label: type }))
]);

// Methods
function handleAddMeal() {
  editingMeal.value = null;
  showAddForm.value = true;
}

function handleEditMeal(meal: Meal) {
  editingMeal.value = meal;
  showAddForm.value = true;
}

function handleDeleteMeal(meal: Meal) {
  if (confirm(`Are you sure you want to delete "${meal.name}"?`)) {
    mealStore.deleteMeal(meal.id);
  }
}

function handleFormClose() {
  showAddForm.value = false;
  editingMeal.value = null;
}
</script>

<template>
  <div class="meal-list-view">
    <!-- Header -->
    <div class="header">
      <h1>My Meals</h1>
      <div class="header-actions">
        <select v-model="selectedMealType" class="meal-type-filter">
          <option v-for="option in mealTypeOptions" :key="option.value" :value="option.value">
            {{ option.label }}
          </option>
        </select>
        <button @click="handleAddMeal" class="add-meal-btn">
          Add Meal
        </button>
      </div>
    </div>

    <!-- Meals List -->
    <div class="meals-container">
      <div v-if="filteredMeals.length === 0" class="empty-state">
        <p>No meals found. {{ selectedMealType === 'All' ? 'Add your first meal!' : `No ${selectedMealType} meals yet.` }}</p>
      </div>
      
      <div v-else class="meals-grid">
        <MealCard
          v-for="meal in filteredMeals"
          :key="meal.id"
          :meal="meal"
          @edit="handleEditMeal"
          @delete="handleDeleteMeal"
        />
      </div>
    </div>

    <!-- Add/Edit Meal Form Modal -->
    <AddMealForm
      v-if="showAddForm"
      :meal="editingMeal"
      @close="handleFormClose"
    />
  </div>
</template>

<style scoped>
.meal-list-view {
  padding: 1rem;
  max-width: 1200px;
  margin: 0 auto;
  height: 100vh;
  display: flex;
  flex-direction: column;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  padding-bottom: 1rem;
  border-bottom: 2px solid #e5e5e5;
}

.header h1 {
  margin: 0;
  color: #333;
  font-size: 2rem;
}

.header-actions {
  display: flex;
  gap: 1rem;
  align-items: center;
}

.meal-type-filter {
  padding: 0.5rem 1rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  background: white;
  font-size: 0.9rem;
}

.add-meal-btn {
  background: #4CAF50;
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.9rem;
  font-weight: 500;
  transition: background-color 0.2s;
}

.add-meal-btn:hover {
  background: #45a049;
}

.meals-container {
  flex: 1;
  overflow-y: auto;
}

.empty-state {
  text-align: center;
  padding: 3rem;
  color: #666;
}

.empty-state p {
  font-size: 1.1rem;
  margin: 0;
}

.meals-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1.5rem;
  padding-bottom: 2rem;
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .meal-list-view {
    padding: 0.5rem;
  }
  
  .header {
    flex-direction: column;
    align-items: stretch;
    gap: 1rem;
  }
  
  .header-actions {
    justify-content: space-between;
  }
  
  .meals-grid {
    grid-template-columns: 1fr;
    gap: 1rem;
  }
  
  .header h1 {
    font-size: 1.5rem;
    text-align: center;
  }
}
</style>
