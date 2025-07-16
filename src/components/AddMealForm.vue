<script setup lang="ts">
import { ref, watch, onMounted } from "vue";
import { useMealStore, type Meal, MealType } from "@/stores/mealStore";

interface Props {
  meal?: Meal | null;
}

interface Emits {
  (e: "close"): void;
}

const props = defineProps<Props>();
const emit = defineEmits<Emits>();

const mealStore = useMealStore();

// Form state
const formData = ref({
  name: "",
  description: "",
  mealType: MealType.Breakfast,
});

const isEditing = ref(false);

// Form validation
const errors = ref({
  name: "",
  description: "",
});

// Watch for prop changes to populate form when editing
watch(
  () => props.meal,
  (newMeal) => {
    if (newMeal) {
      isEditing.value = true;
      formData.value = {
        name: newMeal.name,
        description: newMeal.description,
        mealType: newMeal.mealType,
      };
    } else {
      isEditing.value = false;
      resetForm();
    }
  },
  { immediate: true }
);

// Methods
function resetForm() {
  formData.value = {
    name: "",
    description: "",
    mealType: MealType.Breakfast,
  };
  errors.value = {
    name: "",
    description: "",
  };
}

function validateForm(): boolean {
  errors.value = {
    name: "",
    description: "",
  };

  let isValid = true;

  if (!formData.value.name.trim()) {
    errors.value.name = "Meal name is required";
    isValid = false;
  }

  if (formData.value.name.trim().length > 100) {
    errors.value.name = "Meal name must be less than 100 characters";
    isValid = false;
  }

  if (formData.value.description.length > 500) {
    errors.value.description = "Description must be less than 500 characters";
    isValid = false;
  }

  return isValid;
}

function handleSubmit() {
  if (!validateForm()) {
    return;
  }
  if (isEditing.value && props.meal) {
    // Update existing meal
    mealStore.updateMeal(props.meal.id, {
      name: formData.value.name,
      description: formData.value.description,
      mealType: formData.value.mealType,
    });
  } else {
    // Add new meal
    mealStore.addMeal(
      formData.value.name,
      formData.value.description,
      formData.value.mealType
    );
  }

  emit("close");
}

function handleCancel() {
  emit("close");
}

// Focus on name input when modal opens
const nameInput = ref<HTMLInputElement>();
onMounted(() => {
  nameInput.value?.focus();
});
</script>

<template>
  <div class="modal-overlay" @click="handleCancel">
    <div class="modal-content" @click.stop>
      <div class="modal-header">
        <h2>{{ isEditing ? "Edit Meal" : "Add New Meal" }}</h2>
        <button @click="handleCancel" class="close-btn">×</button>
      </div>

      <form @submit.prevent="handleSubmit" class="meal-form">
        <div class="form-group">
          <label for="name" class="form-label">Meal Name *</label>
          <input
            id="name"
            ref="nameInput"
            v-model="formData.name"
            type="text"
            class="form-input"
            :class="{ error: errors.name }"
            placeholder="Enter meal name..."
            maxlength="100"
          />
          <span v-if="errors.name" class="error-message">{{
            errors.name
          }}</span>
        </div>        <div class="form-group">
          <label for="mealType" class="form-label">Meal Type</label>
          <select id="mealType" v-model="formData.mealType" class="form-select">
            <option
              v-for="type in Object.values(MealType)"
              :key="type"
              :value="type"
            >
              {{ type }}
            </option>
          </select>
        </div>

        <div class="form-group">
          <label for="description" class="form-label">Description</label>
          <textarea
            id="description"
            v-model="formData.description"
            class="form-textarea"
            :class="{ error: errors.description }"
            placeholder="Enter meal description, ingredients, or notes..."
            rows="4"
            maxlength="500"
          ></textarea>
          <div class="character-count">
            {{ formData.description.length }}/500
          </div>
          <span v-if="errors.description" class="error-message">{{
            errors.description
          }}</span>
        </div>

        <div class="form-actions">
          <button type="button" @click="handleCancel" class="btn btn-secondary">
            Cancel
          </button>
          <button type="submit" class="btn btn-primary">
            {{ isEditing ? "Update Meal" : "Add Meal" }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 1rem;
}

.modal-content {
  background: white;
  border-radius: 8px;
  width: 100%;
  max-width: 500px;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem;
  border-bottom: 1px solid #e0e0e0;
}

.modal-header h2 {
  margin: 0;
  color: #333;
  font-size: 1.5rem;
}

.close-btn {
  background: none;
  border: none;
  font-size: 2rem;
  cursor: pointer;
  color: #666;
  padding: 0;
  width: 2rem;
  height: 2rem;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 4px;
  transition: background-color 0.2s;
}

.close-btn:hover {
  background-color: #f5f5f5;
}

.meal-form {
  padding: 1.5rem;
}

.form-group {
  margin-bottom: 1.5rem;
}

.form-label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 500;
  color: #333;
}

.form-input,
.form-select,
.form-textarea {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 1rem;
  transition: border-color 0.2s;
  box-sizing: border-box;
}

.form-input:focus,
.form-select:focus,
.form-textarea:focus {
  outline: none;
  border-color: #2196f3;
}

.form-input.error,
.form-textarea.error {
  border-color: #f44336;
}

.form-textarea {
  resize: vertical;
  min-height: 100px;
}

.character-count {
  text-align: right;
  font-size: 0.8rem;
  color: #666;
  margin-top: 0.25rem;
}

.error-message {
  color: #f44336;
  font-size: 0.85rem;
  margin-top: 0.25rem;
  display: block;
}

.form-actions {
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
  margin-top: 2rem;
  padding-top: 1rem;
  border-top: 1px solid #e0e0e0;
}

.btn {
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 1rem;
  font-weight: 500;
  transition: background-color 0.2s;
}

.btn-secondary {
  background: #f5f5f5;
  color: #333;
}

.btn-secondary:hover {
  background: #e0e0e0;
}

.btn-primary {
  background: #2196f3;
  color: white;
}

.btn-primary:hover {
  background: #1976d2;
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .modal-overlay {
    align-items: flex-start;
    padding: 0.5rem;
  }

  .modal-content {
    margin-top: 2rem;
  }

  .modal-header,
  .meal-form {
    padding: 1rem;
  }

  .form-actions {
    flex-direction: column;
  }

  .btn {
    width: 100%;
  }
}
</style>
