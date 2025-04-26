<script setup lang="ts">
import { ref, nextTick, defineProps, computed } from 'vue'; // Import computed
import { useMealStore, MealSlot, type Meal } from '@/stores/mealStore';
import { marked } from 'marked'; // Import marked

const props = defineProps<{
  date: string;
  slot: MealSlot; // Use MealSlot enum type
}>();

const mealStore = useMealStore();

// --- Local Editing State ---
const isEditing = ref(false);
const editValue = ref<Meal | undefined>();
const editInputRef = ref<HTMLTextAreaElement | null>(null); // Single textarea ref
const editName = ref<string>(''); // For storing the name of the meal

// --- Display Toggles ---
const showRecipe = ref(false);
const showMacros = ref(false);

// --- Computed property for the current meal ---
const currentMeal = computed(() => mealStore.getMeal(props.date, props.slot));

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
  // Reset toggles when starting edit
  showRecipe.value = false;
  showMacros.value = false;
  editValue.value = JSON.parse(JSON.stringify(currentMeal.value || { name: '' })); // Deep copy or create new
  editName.value = editValue.value?.name || '';

  nextTick(() => {
    if (editInputRef.value) {
      editInputRef.value.focus();
      adjustTextareaHeight(); // Adjust height immediately
    }
  });
}

// Function to save the edited meal
function saveEdit() {
  if (!isEditing.value || !editValue.value) return; // Check !editValue.value
  const trimmedName = editName.value.trim();

  // Create a new meal object or update the existing one
  const mealToSave: Meal = {
      ...(editValue.value || {}), // Spread existing properties (like recipe/macros if they were editable)
      name: trimmedName,
  };

  // If name is empty, treat as deletion
  if (!trimmedName) {
      mealStore.setMeal(props.date, props.slot, null);
  } else {
      mealStore.setMeal(props.date, props.slot, mealToSave);
  }

  isEditing.value = false;
  editValue.value = undefined; // Clear edit state
  editName.value = '';
  // Reset toggles after saving
  showRecipe.value = false;
  showMacros.value = false;
}

// Function to cancel editing
function cancelEdit() {
  isEditing.value = false;
  editValue.value = undefined; // Clear edit state
  editName.value = '';
  // Reset toggles after cancelling
  showRecipe.value = false;
  showMacros.value = false;
}

// --- Toggle Functions ---
function toggleRecipe() {
  showRecipe.value = !showRecipe.value;
  if (showRecipe.value) showMacros.value = false; // Optionally close macros when opening recipe
}

function toggleMacros() {
  showMacros.value = !showMacros.value;
  if (showMacros.value) showRecipe.value = false; // Optionally close recipe when opening macros
}

// Function to render markdown (consider adding a sanitizer like DOMPurify for security)
const renderMarkdown = (text: string | undefined) => {
  if (!text) return '';
  try {
    // Basic configuration, you can customize marked options here if needed
    return marked.parse(text);
  } catch (e) {
    console.error("Error parsing markdown:", e);
    return text; // Return original text on error
  }
};

</script>

<template>
  <div class="meal-slot">
    <strong>{{ slot }}:</strong>
    <template v-if="isEditing">
      <textarea
        ref="editInputRef"
        v-model="editName"
        class="edit-input"
        placeholder="Meal name..."
        @input="adjustTextareaHeight"
        @blur="saveEdit"
        @keydown.enter.prevent="saveEdit"
        @keydown.esc.prevent="cancelEdit"
      ></textarea>
      <!-- TODO: Add inputs for recipe/macros here if editing is needed -->
      <div class="edit-actions">
         <button @click.stop="saveEdit" class="btn-save">Save</button>
         <button @click.stop="cancelEdit" class="btn-cancel">Cancel</button>
      </div>
    </template>
    <template v-else>
      <div v-if="currentMeal" class="meal-display">
        <span class="meal-name" @click="startEdit">{{ currentMeal.name }}</span>

        <!-- Recipe Toggle & Display -->
        <div v-if="currentMeal.recipe" class="meal-details">
          <button @click.stop="toggleRecipe" class="btn-toggle">
            {{ showRecipe ? 'Hide' : 'Show' }} Recipe
          </button>
          <!-- Use v-html to render markdown -->
          <div v-if="showRecipe" class="meal-recipe" v-html="renderMarkdown(currentMeal.recipe)"></div>
        </div>

        <!-- Macros Toggle & Display -->
        <div v-if="currentMeal.macros && Object.keys(currentMeal.macros).length > 0" class="meal-details">
           <button @click.stop="toggleMacros" class="btn-toggle">
             {{ showMacros ? 'Hide' : 'Show' }} Macros
           </button>
           <div v-if="showMacros" class="meal-macros">
             <ul>
               <li v-if="currentMeal.macros.calories">Calories: {{ currentMeal.macros.calories }}</li>
               <li v-if="currentMeal.macros.protein">Protein: {{ currentMeal.macros.protein }}g</li>
               <li v-if="currentMeal.macros.carbs">Carbs: {{ currentMeal.macros.carbs }}g</li>
               <li v-if="currentMeal.macros.fat">Fat: {{ currentMeal.macros.fat }}g</li>
             </ul>
           </div>
        </div>
      </div>
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
  margin-bottom: 4px; /* Slightly more space */
}

.meal-display {
  /* Container for name and details */
}

.meal-name {
  font-weight: bold;
  cursor: pointer;
  display: block; /* Ensure it takes its own line */
  margin-bottom: 4px;
  white-space: pre-wrap; /* Preserve whitespace and wrap lines */
  word-break: break-word;
}
.meal-name:hover {
  text-decoration: underline;
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

/* Styles for toggles and details */
.meal-details {
  margin-top: 5px;
  font-size: 0.9em;
}

.btn-toggle {
  background-color: #e0e0e0;
  border: 1px solid #ccc;
  padding: 2px 6px;
  font-size: 0.85em;
  border-radius: 3px;
  cursor: pointer;
  margin-bottom: 3px;
}
.btn-toggle:hover {
  background-color: #d0d0d0;
}

.meal-recipe {
  background-color: #f0f0f0;
  border: 1px solid #e0e0e0;
  padding: 4px 6px;
  border-radius: 3px;
  margin-top: 2px;
  /* Add styles for markdown elements within the recipe if needed */
  /* These are similar to the chat example, adjust as necessary */
}
.meal-recipe :deep(p) {
  margin: 0 0 0.5em 0;
}
.meal-recipe :deep(ul), .meal-recipe :deep(ol) {
  padding-left: 20px;
  margin-bottom: 0.5em;
}
.meal-recipe :deep(li) {
  margin-bottom: 0.2em;
}
.meal-recipe :deep(code) {
  background-color: rgba(0,0,0,0.05);
  padding: 0.2em 0.4em;
  border-radius: 3px;
  font-family: monospace;
  font-size: 0.95em; /* Slightly smaller for inline code */
}
.meal-recipe :deep(pre) {
  background-color: rgba(0,0,0,0.07);
  padding: 8px; /* Adjust padding */
  border-radius: 5px;
  overflow-x: auto;
  font-size: 0.9em; /* Adjust font size for code blocks */
}
.meal-recipe :deep(pre) code {
  background-color: transparent;
  padding: 0;
  font-size: inherit; /* Inherit pre's font size */
}
.meal-recipe :deep(a) {
  color: #007bff;
  text-decoration: underline;
}
.meal-recipe :deep(blockquote) {
  border-left: 3px solid #ccc;
  padding-left: 10px;
  margin-left: 0;
  color: #555;
}


.meal-macros ul {
  list-style: none;
  padding: 0;
  margin: 0;
}
.meal-macros li {
  margin-bottom: 2px;
}

/* Style the displayed meal item to respect whitespace */
/* .meal-item is replaced by .meal-name and detail sections */
/* Remove if .meal-item class is no longer used */
/*
.meal-item {
  white-space: pre-wrap;
}
*/
</style>
