<script lang="ts" setup>
import type { Meal } from "@mealplanner/shared-all";
import { getCurrentInstance } from "vue";
import MarkdownRenderer from "./MarkdownRenderer.vue";

interface Props {
    meal: Meal & { planItemId?: string };
}

const emit = defineEmits<{
    delete: [mealId: string, planItemId?: string];
}>();

const props = defineProps<Props>();

const instance = getCurrentInstance();
const uniqueId = `toggle-${props.meal.id}-${
    instance?.uid || Math.random().toString(36).slice(2, 11)
}`;

function formatMealTypes(mealTypes: string[]): string {
    return mealTypes.join(", ");
}

function formatDate(date: Date): string {
    return new Intl.DateTimeFormat("fr-FR", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
    }).format(date);
}

function handleDelete(event: Event) {
    event.stopPropagation();
    event.preventDefault();

    emit("delete", props.meal.id, props.meal.planItemId);
}
</script>

<template>
    <div class="meal-card">
        <div class="meal-description">
            <input type="checkbox" :id="uniqueId" class="toggle-checkbox" />
            <label :for="uniqueId" class="meal-card-clickable">
                <div class="meal-header">
                    <h3 class="meal-name">{{ meal.name }}</h3>
                    <div class="meal-header-actions">
                        <span class="meal-types">{{
                            formatMealTypes(meal.mealTypes)
                        }}</span>
                        <button
                            @click="handleDelete"
                            class="delete-button"
                            type="button"
                        >
                            <span class="delete-icon">🗑️</span>
                        </button>
                    </div>
                </div>
                <div class="description-content">
                    <MarkdownRenderer>{{ meal.description }}</MarkdownRenderer>
                </div>
                <div class="meal-footer">
                    <span class="meal-date">{{
                        formatDate(meal.createdAt)
                    }}</span>
                    <span class="toggle-hint">
                        <span class="show-more">▼</span>
                        <span class="show-less">▲</span>
                    </span>
                </div>
            </label>
        </div>
    </div>
</template>

<style scoped>
.meal-card {
    background-color: var(--bg-secondary);
    color: var(--text-primary);
    border: 1px solid var(--border-light);
    border-radius: 8px;
    padding: 0;
    margin: 8px 0;
    transition: transform 0.2s ease, box-shadow 0.2s ease;
    overflow: hidden;
}

.meal-card:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

.meal-card-clickable {
    display: block;
    padding: 16px;
    cursor: pointer;
    color: inherit;
    text-decoration: none;
    width: 100%;
    border: none;
    background: none;
    box-sizing: border-box;
    overflow: hidden;
}

.meal-description {
    margin: 0;
    line-height: 1.4;
    color: var(--text-secondary, #666);
    position: relative;
}

.meal-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 8px;
    flex-wrap: wrap;
    gap: 8px;
}

.meal-name {
    margin: 0;
    font-size: 1.1rem;
    font-weight: 600;
    flex: 1;
    min-width: 0;
}

.meal-header-actions {
    display: flex;
    align-items: center;
    gap: 8px;
    flex-shrink: 0;
}

.meal-types {
    font-size: 0.8rem;
    color: var(--text-secondary, #666);
    background-color: var(--bg-primary);
    padding: 4px 8px;
    border-radius: 12px;
    white-space: nowrap;
}

.delete-button {
    background: none;
    border: none;
    cursor: pointer;
    padding: 4px;
    border-radius: 4px;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: background-color 0.2s ease, transform 0.1s ease;
    min-width: 24px;
    height: 24px;
}

.delete-button:hover {
    background-color: var(--danger-bg, rgba(220, 53, 69, 0.1));
    transform: scale(1.1);
}

.delete-button:active {
    transform: scale(0.95);
}

.delete-icon {
    font-size: 0.9rem;
    opacity: 0.7;
    transition: opacity 0.2s ease;
}

.delete-button:hover .delete-icon {
    opacity: 1;
}

.description-content {
    overflow: hidden;
    transition: max-height 0.4s ease-in-out;
    margin-bottom: 12px;
    word-wrap: break-word;
    word-break: break-word;
    max-width: 100%;
    max-height: 5em;
    position: relative;
}

.description-content::after {
    content: "";
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    height: 3em;
    background: linear-gradient(
        to bottom,
        transparent 0%,
        color-mix(in srgb, var(--bg-secondary) 10%, transparent) 20%,
        color-mix(in srgb, var(--bg-secondary) 30%, transparent) 40%,
        color-mix(in srgb, var(--bg-secondary) 60%, transparent) 60%,
        color-mix(in srgb, var(--bg-secondary) 90%, transparent) 80%,
        var(--bg-secondary) 100%
    );
    pointer-events: none;
    opacity: 1;
    transition: opacity 0.3s ease;
}

.toggle-checkbox {
    position: absolute;
    opacity: 0;
    cursor: pointer;
    height: 0;
    width: 0;
}

.toggle-hint {
    font-size: 1rem;
    color: var(--accent-color);
    transition: transform 0.2s ease, color 0.2s ease;
    user-select: none;
}

.meal-card-clickable:hover .toggle-hint {
    transform: scale(1.1);
    color: var(--accent-color-hover, #0056b3);
}

/* Animation de rotation pour la flèche */
.toggle-checkbox:checked ~ .meal-card-clickable .toggle-hint {
    animation: bounce 0.3s ease-in-out;
}

@keyframes bounce {
    0%,
    100% {
        transform: scale(1);
    }
    50% {
        transform: scale(1.2);
    }
}

.meal-footer {
    display: flex;
    justify-content: space-between;
    align-items: center;
    flex-wrap: wrap;
    gap: 8px;
}

.meal-date {
    font-size: 0.8rem;
    color: var(--text-tertiary, #999);
}

/* État par défaut : afficher "Voir plus", masquer "Voir moins" */
.show-less {
    display: none;
}

.show-more {
    display: inline;
}

/* État étendu : afficher tout le contenu */
.toggle-checkbox:checked ~ .meal-card-clickable .description-content {
    max-height: none;
}

/* Masquer le gradient en mode étendu */
.toggle-checkbox:checked ~ .meal-card-clickable .description-content::after {
    opacity: 0;
}

/* État étendu : afficher "Voir moins", masquer "Voir plus" */
.toggle-checkbox:checked ~ .meal-card-clickable .toggle-hint .show-more {
    display: none;
}

.toggle-checkbox:checked ~ .meal-card-clickable .toggle-hint .show-less {
    display: inline;
}

/* Mobile-first responsive design */
@media (max-width: 480px) {
    .meal-header {
        flex-direction: column;
        align-items: flex-start;
        gap: 12px;
    }

    .meal-header-actions {
        align-self: stretch;
        justify-content: space-between;
    }

    .meal-types {
        flex: 1;
    }

    .delete-button {
        min-width: 32px;
        height: 32px;
    }

    .delete-icon {
        font-size: 1rem;
    }
}
</style>
