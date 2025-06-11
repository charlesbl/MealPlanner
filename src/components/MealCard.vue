<script setup lang="ts">
import { type Meal } from '@/stores/mealStore';

interface Props {
  meal: Meal;
}

interface Emits {
  (e: 'edit', meal: Meal): void;
  (e: 'delete', meal: Meal): void;
}

const props = defineProps<Props>();
const emit = defineEmits<Emits>();

// Format date for display
function formatDate(date: Date): string {
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

// Get meal type color
function getMealTypeColor(mealType: string): string {
  const colors: Record<string, string> = {
    Breakfast: '#FF9800',
    Lunch: '#2196F3',
    Dinner: '#4CAF50',
    Snacks: '#9C27B0',
  };
  return colors[mealType] || '#757575';
}
</script>

<template>
  <div class="meal-card">
    <div class="meal-header">      <div class="meal-type-badge" :style="{ backgroundColor: getMealTypeColor(props.meal.mealType) }">
        {{ props.meal.mealType }}
      </div>
      <div class="meal-actions">
        <button @click="emit('edit', props.meal)" class="action-btn edit-btn" title="Edit meal">
          ✏️
        </button>
        <button @click="emit('delete', props.meal)" class="action-btn delete-btn" title="Delete meal">
          🗑️
        </button>
      </div>
    </div>
      <div class="meal-content">      <h3 class="meal-name">{{ props.meal.name }}</h3>
      <p class="meal-description">{{ props.meal.description }}</p>
      <div class="meal-date">
        <span class="date-label">📅 {{ formatDate(props.meal.date) }}</span>
      </div>
    </div>
    
    <div class="meal-footer">
      <span class="created-date">Added {{ formatDate(props.meal.createdAt) }}</span>
    </div>
  </div>
</template>

<style scoped>
.meal-card {
  background: white;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  padding: 1rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  transition: box-shadow 0.2s, transform 0.2s;
  display: flex;
  flex-direction: column;
  height: 100%;
}

.meal-card:hover {
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
  transform: translateY(-2px);
}

.meal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.75rem;
}

.meal-type-badge {
  color: white;
  padding: 0.25rem 0.75rem;
  border-radius: 12px;
  font-size: 0.8rem;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.meal-actions {
  display: flex;
  gap: 0.5rem;
}

.action-btn {
  background: none;
  border: none;
  cursor: pointer;
  padding: 0.25rem;
  border-radius: 4px;
  font-size: 1rem;
  transition: background-color 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 2rem;
  height: 2rem;
}

.action-btn:hover {
  background-color: #f5f5f5;
}

.edit-btn:hover {
  background-color: #e3f2fd;
}

.delete-btn:hover {
  background-color: #ffebee;
}

.meal-content {
  flex: 1;
  margin-bottom: 1rem;
}

.meal-name {
  margin: 0 0 0.5rem 0;
  font-size: 1.25rem;
  font-weight: 600;
  color: #333;
  line-height: 1.3;
}

.meal-description {
  margin: 0;
  color: #666;
  line-height: 1.5;
  font-size: 0.95rem;
}

.meal-date {
  margin-top: 0.75rem;
}

.date-label {
  font-size: 0.9rem;
  color: #2196F3;
  font-weight: 500;
}

.meal-footer {
  margin-top: auto;
  padding-top: 0.75rem;
  border-top: 1px solid #f0f0f0;
}

.created-date {
  font-size: 0.8rem;
  color: #999;
  font-style: italic;
}

/* Empty description state */
.meal-description:empty::before {
  content: "No description provided";
  color: #ccc;
  font-style: italic;
}

/* Responsive adjustments */
@media (max-width: 480px) {
  .meal-card {
    padding: 0.75rem;
  }
  
  .meal-name {
    font-size: 1.1rem;
  }
  
  .meal-description {
    font-size: 0.9rem;
  }
  
  .action-btn {
    width: 1.75rem;
    height: 1.75rem;
    font-size: 0.9rem;
  }
}
</style>
