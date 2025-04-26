<script setup lang="ts">
import { ref, nextTick, defineProps } from 'vue';
import { useMealStore, MealSlot } from '@/stores/mealStore';

const props = defineProps<{ 
  date: string;
  slot: MealSlot; // Use MealSlot enum type
}>();

const mealStore = useMealStore();

// --- Local Editing State ---
const isEditing = ref(false);
const editValue = ref('');
const editInputRef = ref<HTMLTextAreaElement | null>(null); // Single textarea ref

// Function to adjust textarea height dynamically
function adjustTextareaHeight(event?: Event) {
  const textarea = event ? event.target as HTMLTextAreaElement : editInputRef.value;
  if (textarea) {
    textarea.style.height = 'auto';
    textarea.style.height = `${textarea.scrollHeight}px`;
  }
}

// Function to start editing a meal slot
function startEdit() {
  isEditing.value = true;
  editValue.value = mealStore.getMeal(props.date, props.slot) || '';

  nextTick(() => {
    if (editInputRef.value) {
      editInputRef.value.focus();
      adjustTextareaHeight(); // Adjust height immediately
    }
  });
}

// Function to save the edited meal
function saveEdit() {
  if (!isEditing.value) return;
  const trimmedValue = editValue.value.trim();
  mealStore.setMeal(props.date, props.slot, trimmedValue);
  isEditing.value = false;
  editValue.value = '';
}

// Function to cancel editing
function cancelEdit() {
  isEditing.value = false;
  editValue.value = '';
}
</script>

<template>
  <div class="meal-slot">
    <strong>{{ slot }}:</strong>
    <template v-if="isEditing">
      <textarea
        ref="editInputRef"
        v-model="editValue"
        class="edit-input"
        @input="adjustTextareaHeight"
        @blur="saveEdit" 
        @keydown.enter.prevent="saveEdit" 
        @keydown.esc.prevent="cancelEdit"
      ></textarea>
      <div class="edit-actions">
         <button @click.stop="saveEdit" class="btn-save">Save</button>
         <button @click.stop="cancelEdit" class="btn-cancel">Cancel</button>
      </div>
    </template>
    <template v-else>
      <span v-if="mealStore.meals[date]?.[slot]" class="meal-item" @click="startEdit">
        {{ mealStore.meals[date][slot] }}
      </span>
      <span v-else class="meal-placeholder" @click="startEdit">
        + Add Meal
      </span>
    </template>
  </div>
</template>

<style scoped>
/* Styles moved from CalendarView relevant to MealSlotDisplay */
.meal-slot {
  background-color: #f9f9f9;
  padding: 4px 6px;
  border-radius: 3px;
  font-size: 0.85em;
  min-height: 36px; /* Adjust min-height if needed */
}

.meal-slot strong {
  color: #555;
  display: block; /* Make label take its own line */
  margin-bottom: 2px; /* Add a small space below the label */
}

.meal-item, .meal-placeholder, .edit-input {
  cursor: pointer;
  text-align: left; /* Align text to the left */
  min-height: 1.2em; /* Ensure minimum height */
  display: block; /* Make item/input take full width */
  width: 100%; /* Ensure it takes full width */
  word-break: break-word; /* Allow long words to break */
  box-sizing: border-box; /* Ensure padding/border are included in width */
}

.meal-placeholder {
  font-style: italic;
  color: #aaa;
  font-size: 0.9em;
}
.meal-placeholder:hover {
  color: #777;
}

.edit-input {
  padding: 2px 4px;
  border: 1px solid #ccc;
  border-radius: 3px;
  font-size: inherit; /* Match surrounding text size */
  box-sizing: border-box; /* Include padding/border in width */
  width: 100%; /* Take full width */
  resize: none; /* Disable manual resize, use auto-adjust */
  min-height: 2.5em; /* Ensure a minimum height for textarea */
  line-height: 1.2; /* Improve readability for multi-line */
  margin-bottom: 4px; /* Add space below textarea before buttons */
  overflow-y: hidden; /* Hide vertical scrollbar initially */
}

.edit-actions {
  display: flex;
  justify-content: flex-end; /* Align buttons to the right */
  gap: 5px; /* Space between buttons */
  margin-top: 4px; /* Add space above buttons */
}

.edit-actions button {
  padding: 3px 8px;
  font-size: 0.9em;
  border-radius: 3px;
  cursor: pointer;
  border: 1px solid transparent;
}

.btn-save {
  background-color: #28a745;
  color: white;
  border-color: #28a745;
}
.btn-save:hover {
  background-color: #218838;
  border-color: #1e7e34;
}

.btn-cancel {
  background-color: #dc3545;
  color: white;
  border-color: #dc3545;
}
.btn-cancel:hover {
  background-color: #c82333;
  border-color: #bd2130;
}

/* Style the displayed meal item to respect whitespace */
.meal-item {
  white-space: pre-wrap; /* Preserve whitespace and wrap lines */
}
</style>
