<script setup lang="ts">
import CalorieRing from "@/components/CalorieRing.vue";
import MacroBar from "@/components/MacroBar.vue";
import WeekChart from "@/components/WeekChart.vue";
import AppCard from "@/components/ui/AppCard.vue";
import AppDivider from "@/components/ui/AppDivider.vue";
import SectionLabel from "@/components/ui/SectionLabel.vue";
import { useJournalStore } from "@/stores/journalStore";
import { useProfileStore } from "@/stores/profileStore";
import type { MealType } from "@mealplanner/shared-all";
import { computed, ref, watch } from "vue";
import { useRoute, useRouter } from "vue-router";

const route = useRoute();
const router = useRouter();
const journalStore = useJournalStore();
const profileStore = useProfileStore();

function todayISO() {
    return new Date().toISOString().split("T")[0];
}

const currentDate = computed(() => {
    const p = route.params.date;
    return typeof p === "string" ? p : todayISO();
});

// Format date for display: "JEUDI · 19 FÉVRIER"
const formattedDate = computed(() => {
    const d = new Date(currentDate.value + "T12:00:00");
    const weekday = d
        .toLocaleDateString("fr-FR", { weekday: "long" })
        .toUpperCase();
    const day = d.getDate();
    const month = d
        .toLocaleDateString("fr-FR", { month: "long" })
        .toUpperCase();
    return `${weekday} · ${day} ${month}`;
});

function navigateDate(offset: number) {
    const d = new Date(currentDate.value + "T12:00:00");
    d.setDate(d.getDate() + offset);
    const newDate = d.toISOString().split("T")[0];
    const today = todayISO();
    if (newDate > today) return; // no future
    if (newDate === today) {
        router.push("/journal");
    } else {
        router.push(`/journal/${newDate}`);
    }
}

const isToday = computed(() => currentDate.value === todayISO());

// Goals from profile
const calorieGoal = computed(() => profileStore.profile?.calorieGoal ?? 2000);
const proteinGoal = computed(() => profileStore.profile?.proteinGoal ?? 0);
const carbsGoal = computed(() => profileStore.profile?.carbsGoal ?? 0);
const fatGoal = computed(() => profileStore.profile?.fatGoal ?? 0);

// Entries grouped by mealType
const MEAL_TYPES: MealType[] = ["breakfast", "lunch", "dinner", "snack"];
const MEAL_LABELS: Record<MealType, string> = {
    breakfast: "MATIN",
    lunch: "MIDI",
    dinner: "SOIR",
    snack: "SNACK",
};

function entriesForMeal(mealType: MealType) {
    return journalStore.entries.filter((e) => e.mealType === mealType);
}

// Add entry state
const expandedMeal = ref<MealType | null>(null);
const addText = ref("");
const addingMeal = ref<MealType | null>(null);

function toggleAdd(mealType: MealType) {
    if (expandedMeal.value === mealType) {
        expandedMeal.value = null;
        addText.value = "";
    } else {
        expandedMeal.value = mealType;
        addText.value = "";
    }
}

async function submitAdd(mealType: MealType) {
    const desc = addText.value.trim();
    if (!desc) return;
    addingMeal.value = mealType;
    try {
        await journalStore.addEntry(desc, mealType, currentDate.value);
        addText.value = "";
        expandedMeal.value = null;
    } finally {
        addingMeal.value = null;
    }
}

// Fetch on date change
watch(
    currentDate,
    (date) => {
        journalStore.fetchDay(date);
        journalStore.fetchWeek(date);
    },
    { immediate: true },
);
</script>

<template>
    <div class="journal-page">
        <!-- Date navigation -->
        <div class="date-nav">
            <button class="nav-btn" @click="navigateDate(-1)">←</button>
            <span class="date-label">{{ formattedDate }}</span>
            <button
                class="nav-btn"
                @click="navigateDate(1)"
                :disabled="isToday"
                :class="{ 'nav-btn-disabled': isToday }"
            >
                →
            </button>
        </div>

        <!-- Calorie summary -->
        <AppCard class="summary-card">
            <div class="summary-ring">
                <CalorieRing
                    :consumed="journalStore.totals.calories"
                    :goal="calorieGoal"
                    :size="140"
                />
            </div>
            <div class="macro-bars">
                <MacroBar
                    label="Protéines"
                    :current="journalStore.totals.protein"
                    :goal="proteinGoal"
                />
                <MacroBar
                    label="Glucides"
                    :current="journalStore.totals.carbs"
                    :goal="carbsGoal"
                />
                <MacroBar
                    label="Lipides"
                    :current="journalStore.totals.fat"
                    :goal="fatGoal"
                />
            </div>
        </AppCard>

        <!-- Meal sections -->
        <template v-for="mealType in MEAL_TYPES" :key="mealType">
            <SectionLabel class="meal-label">{{
                MEAL_LABELS[mealType]
            }}</SectionLabel>
            <AppCard :noPadding="true" class="meal-card">
                <!-- Entries -->
                <template
                    v-for="entry in entriesForMeal(mealType)"
                    :key="entry.id"
                >
                    <div
                        class="entry-row"
                        :class="{ 'entry-row--error': entry.status === 'error' }"
                    >
                        <span class="entry-desc">{{ entry.description }}</span>
                        <!-- Pending: spinner -->
                        <span
                            v-if="entry.status === 'pending'"
                            class="entry-status-pending"
                        >
                            <span class="loading-spinner"></span>
                        </span>
                        <!-- Error: message + retry -->
                        <template v-else-if="entry.status === 'error'">
                            <span class="entry-status-error">Erreur</span>
                            <button
                                class="retry-btn"
                                @click="journalStore.retryEntry(entry.id)"
                                aria-label="Réessayer"
                            >
                                ↺
                            </button>
                        </template>
                        <!-- Completed: kcal -->
                        <span v-else class="entry-cal">
                            {{ entry.nutrition.calories }} kcal
                        </span>
                        <button
                            class="entry-delete"
                            @click="journalStore.deleteEntry(entry.id)"
                            aria-label="Supprimer"
                        >
                            ✕
                        </button>
                    </div>
                    <AppDivider />
                </template>

                <!-- Add entry row -->
                <div
                    v-if="expandedMeal !== mealType"
                    class="add-collapsed"
                    @click="toggleAdd(mealType)"
                >
                    + Ajouter un repas
                </div>
                <div v-else class="add-expanded">
                    <input
                        class="add-input"
                        v-model="addText"
                        placeholder="Ex: un bol de pâtes au saumon"
                        @keydown.enter="submitAdd(mealType)"
                        @keydown.escape="toggleAdd(mealType)"
                        autofocus
                    />
                    <button
                        class="add-submit"
                        @click="submitAdd(mealType)"
                        :disabled="addingMeal === mealType"
                    >
                        ▶
                    </button>
                </div>
            </AppCard>
        </template>

        <!-- Week chart -->
        <SectionLabel class="meal-label">CETTE SEMAINE</SectionLabel>
        <AppCard class="week-card">
            <WeekChart
                :days="journalStore.weekData"
                :activeDate="currentDate"
                :calorieGoal="calorieGoal"
            />
        </AppCard>
    </div>
</template>

<style scoped>
.journal-page {
    padding: 16px 16px 32px;
    display: flex;
    flex-direction: column;
    gap: 0;
}

/* Date navigation */
.date-nav {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 16px;
}

.nav-btn {
    background: none;
    border: none;
    color: var(--color-text);
    font-size: 20px;
    cursor: pointer;
    padding: 4px 8px;
    opacity: 0.8;
    transition: opacity 0.15s;
}

.nav-btn:hover {
    opacity: 1;
}

.nav-btn-disabled {
    opacity: 0.25;
    cursor: default;
}

.date-label {
    font-size: 13px;
    font-weight: 500;
    color: var(--color-text);
    letter-spacing: 0.05em;
}

/* Summary card */
.summary-card {
    margin-bottom: 16px;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 16px;
}

.summary-ring {
    display: flex;
    justify-content: center;
}

.macro-bars {
    width: 100%;
    display: flex;
    flex-direction: column;
    gap: 10px;
}

/* Meal sections */
.meal-label {
    display: block;
    margin-top: 16px;
    margin-bottom: 6px;
}

.meal-card {
    margin-bottom: 0;
}

.week-card {
    margin-top: 8px;
}

/* Entry row */
.entry-row {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 12px 16px;
}

.entry-desc {
    flex: 1;
    font-size: 14px;
    color: var(--color-text);
}

.entry-cal {
    font-size: 13px;
    color: var(--color-muted);
    white-space: nowrap;
}

.entry-delete {
    background: none;
    border: none;
    color: var(--color-muted);
    cursor: pointer;
    font-size: 12px;
    padding: 2px 4px;
    opacity: 0.6;
    transition: opacity 0.15s;
}

.entry-delete:hover {
    opacity: 1;
    color: #f87171;
}

/* Entry status */
.entry-row--error .entry-desc {
    opacity: 0.6;
}

.entry-status-pending {
    display: flex;
    align-items: center;
}

.entry-status-error {
    font-size: 12px;
    color: #f87171;
    white-space: nowrap;
}

.retry-btn {
    background: none;
    border: none;
    color: #f87171;
    font-size: 16px;
    cursor: pointer;
    padding: 2px 4px;
    line-height: 1;
    transition: opacity 0.15s;
}

.retry-btn:hover {
    opacity: 0.7;
}

.loading-spinner {
    width: 14px;
    height: 14px;
    border: 2px solid var(--color-border);
    border-top-color: var(--color-accent);
    border-radius: 50%;
    animation: spin 0.7s linear infinite;
    flex-shrink: 0;
}

@keyframes spin {
    to {
        transform: rotate(360deg);
    }
}

/* Add row */
.add-collapsed {
    padding: 12px 16px;
    font-size: 13px;
    color: var(--color-muted);
    cursor: pointer;
    border: 1px dashed var(--color-border);
    border-radius: 4px;
    margin: 8px;
    text-align: center;
    transition: opacity 0.15s;
}

.add-collapsed:hover {
    opacity: 0.8;
}

.add-expanded {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 8px 16px;
}

.add-input {
    flex: 1;
    background: none;
    border: none;
    border-bottom: 1px solid var(--color-border);
    color: var(--color-text);
    font-size: 14px;
    padding: 6px 0;
    outline: none;
}

.add-input::placeholder {
    color: var(--color-muted);
}

.add-submit {
    background: none;
    border: none;
    color: var(--color-accent);
    font-size: 16px;
    cursor: pointer;
    padding: 4px;
    opacity: 0.9;
    transition: opacity 0.15s;
}

.add-submit:hover {
    opacity: 1;
}

.add-submit:disabled {
    opacity: 0.4;
    cursor: default;
}
</style>
