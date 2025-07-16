<script setup lang="ts">
import { type Meal } from "@/stores/mealStore";
import { renderMarkdown } from "@/utils/markdown";
import { computed, ref } from "vue";

interface Props {
    meal: Meal;
    isInWeek?: boolean;
}

interface Emits {
    (e: "edit", meal: Meal): void;
    (e: "delete", meal: Meal): void;
    (e: "add-to-week", meal: Meal): void;
    (e: "remove-from-week", meal: Meal): void;
}

const props = defineProps<Props>();
const emit = defineEmits<Emits>();

// State for show more/less functionality
const showFullDescription = ref(false);
const MAX_DESCRIPTION_LENGTH = 150;

// Check if description is long enough to need truncation
const isDescriptionLong = computed(() => {
    return (
        props.meal.description &&
        props.meal.description.length > MAX_DESCRIPTION_LENGTH
    );
});

// Get truncated description for display
const displayDescription = computed(() => {
    if (!props.meal.description) return "";
    if (!isDescriptionLong.value || showFullDescription.value) {
        return renderMarkdown(props.meal.description);
    }
    const truncated =
        props.meal.description.substring(0, MAX_DESCRIPTION_LENGTH) + "...";
    return renderMarkdown(truncated);
});

// Toggle show more/less
function toggleDescription() {
    showFullDescription.value = !showFullDescription.value;
}

// Format date for display
function formatDate(date: Date): string {
    return date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
    });
}

// Get meal type color
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

<template>
    <div class="meal-card">
        <div class="meal-header">
            <div
                class="meal-type-badge"
                :style="{
                    backgroundColor: getMealTypeColor(props.meal.mealType),
                }"
            >
                {{ props.meal.mealType }}
            </div>
            <div class="meal-actions">
                <button
                    @click="emit('edit', props.meal)"
                    class="action-btn edit-btn"
                    title="Edit meal"
                >
                    ✏️
                </button>
                <button
                    @click="emit('delete', props.meal)"
                    class="action-btn delete-btn"
                    title="Delete meal"
                >
                    🗑️
                </button>
                <button
                    v-if="!props.isInWeek"
                    @click="emit('add-to-week', props.meal)"
                    class="action-btn week-btn add-week-btn"
                    title="Add to week"
                >
                    ➕
                </button>
                <button
                    v-else
                    @click="emit('remove-from-week', props.meal)"
                    class="action-btn week-btn remove-week-btn"
                    title="Remove from week"
                >
                    ➖
                </button>
            </div>
        </div>
        <div class="meal-content">
            <h3 class="meal-name">{{ props.meal.name }}</h3>
            <div class="meal-description" v-html="displayDescription"></div>
            <button
                v-if="isDescriptionLong"
                @click="toggleDescription"
                class="show-more-btn"
                type="button"
            >
                {{ showFullDescription ? "Show less" : "Show more" }}
            </button>
            <div class="meal-date">
                <span class="date-label">
                    📅 Créé le {{ formatDate(props.meal.createdAt) }}
                </span>
                <span v-if="props.isInWeek" class="week-indicator">
                    ⭐ Dans ma semaine
                </span>
            </div>
        </div>

        <div class="meal-footer">
            <span class="created-date"
                >Added {{ formatDate(props.meal.createdAt) }}</span
            >
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

.week-btn {
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

.add-week-btn:hover {
    background-color: #e8f5e8;
}

.remove-week-btn:hover {
    background-color: #fff3cd;
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

/* Markdown content styling */
.meal-description :deep(h1),
.meal-description :deep(h2),
.meal-description :deep(h3),
.meal-description :deep(h4),
.meal-description :deep(h5),
.meal-description :deep(h6) {
    margin: 0.5rem 0 0.25rem 0;
    color: #333;
    font-weight: 600;
}

.meal-description :deep(h1) {
    font-size: 1.1rem;
}
.meal-description :deep(h2) {
    font-size: 1rem;
}
.meal-description :deep(h3) {
    font-size: 0.95rem;
}
.meal-description :deep(h4) {
    font-size: 0.9rem;
}
.meal-description :deep(h5) {
    font-size: 0.85rem;
}
.meal-description :deep(h6) {
    font-size: 0.8rem;
}

.meal-description :deep(p) {
    margin: 0.25rem 0;
    line-height: 1.5;
}

.meal-description :deep(ul),
.meal-description :deep(ol) {
    margin: 0.25rem 0;
    padding-left: 1.5rem;
}

.meal-description :deep(li) {
    margin: 0.125rem 0;
}

.meal-description :deep(strong) {
    font-weight: 600;
    color: #333;
}

.meal-description :deep(em) {
    font-style: italic;
    color: #555;
}

.meal-description :deep(code) {
    background-color: #f5f5f5;
    padding: 0.125rem 0.25rem;
    border-radius: 3px;
    font-family: "Courier New", monospace;
    font-size: 0.85rem;
    color: #d73502;
}

.meal-description :deep(blockquote) {
    border-left: 3px solid #ddd;
    margin: 0.5rem 0;
    padding-left: 1rem;
    color: #666;
    font-style: italic;
}

.meal-description :deep(a) {
    color: #2196f3;
    text-decoration: none;
}

.meal-description :deep(a:hover) {
    text-decoration: underline;
}

.show-more-btn {
    background: none;
    border: none;
    color: #2196f3;
    cursor: pointer;
    font-size: 0.875rem;
    font-weight: 500;
    padding: 0.25rem 0;
    margin-top: 0.5rem;
    text-decoration: none;
    transition: color 0.2s;
}

.show-more-btn:hover {
    color: #1976d2;
    text-decoration: underline;
}

.show-more-btn:focus {
    outline: 2px solid #2196f3;
    outline-offset: 2px;
    border-radius: 2px;
}

.meal-date {
    margin-top: 0.75rem;
}

.date-label {
    font-size: 0.9rem;
    color: #2196f3;
    font-weight: 500;
}

.week-indicator {
    font-size: 0.8rem;
    color: #ff9800;
    font-weight: 600;
    margin-left: 10px;
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
