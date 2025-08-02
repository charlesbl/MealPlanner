<script lang="ts" setup>
import type { Meal } from "../stores/mealStore";
import MarkdownRenderer from "./MarkdownRenderer.vue";

interface Props {
    meal: Meal;
}

defineProps<Props>();

function formatMealTypes(mealTypes: string[]): string {
    // TODO delete this
    if (typeof mealTypes === "undefined") {
        return "";
    }
    return mealTypes.join(", ");
}

function formatDate(date: Date): string {
    return new Intl.DateTimeFormat("fr-FR", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
    }).format(date);
}
</script>

<template>
    <div class="meal-card">
        <div class="meal-description">
            <input
                type="checkbox"
                :id="`toggle-${meal.id}`"
                class="toggle-checkbox"
            />
            <label :for="`toggle-${meal.id}`" class="meal-card-clickable">
                <div class="meal-header">
                    <h3 class="meal-name">{{ meal.name }}</h3>
                    <span class="meal-types">{{
                        formatMealTypes(meal.mealTypes)
                    }}</span>
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

.meal-types {
    font-size: 0.8rem;
    color: var(--text-secondary, #666);
    background-color: var(--bg-primary);
    padding: 4px 8px;
    border-radius: 12px;
    white-space: nowrap;
}

.description-content {
    overflow: hidden;
    transition: max-height 0.4s ease-in-out;
    margin-bottom: 12px;
    word-wrap: break-word;
    word-break: break-word;
    max-width: 100%;
    max-height: 4.5em; /* Hauteur approximative pour 3 lignes */
    position: relative;
}

/* Effet de fade-out pour le texte tronqué */
.description-content::after {
    content: "";
    position: absolute;
    bottom: 0;
    right: 0;
    width: 40px;
    height: 1.5em;
    background: linear-gradient(to right, transparent, var(--bg-secondary));
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
    max-height: 500px; /* Hauteur maximale généreuse pour l'animation */
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
    }

    .meal-types {
        align-self: flex-start;
    }
}
</style>
