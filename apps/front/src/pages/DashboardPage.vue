<script setup lang="ts">
import CalorieRing from "@/components/CalorieRing.vue";
import MacroBar from "@/components/MacroBar.vue";
import WeekPlanStrip from "@/components/WeekPlanStrip.vue";
import AppCard from "@/components/ui/AppCard.vue";
import SectionLabel from "@/components/ui/SectionLabel.vue";
import { useJournalStore } from "@/stores/journalStore";
import { useProfileStore } from "@/stores/profileStore";
import { computed, onMounted } from "vue";
import { useRouter } from "vue-router";

const router = useRouter();
const journalStore = useJournalStore();
const profileStore = useProfileStore();

function todayISO() {
    return new Date().toISOString().split("T")[0];
}

const today = todayISO();

// Formatted date: "JEUDI · 19 FÉVRIER"
const formattedDate = computed(() => {
    const d = new Date(today + "T12:00:00");
    const weekday = d
        .toLocaleDateString("fr-FR", { weekday: "long" })
        .toUpperCase();
    const day = d.getDate();
    const month = d
        .toLocaleDateString("fr-FR", { month: "long" })
        .toUpperCase();
    return `${weekday} · ${day} ${month}`;
});

const calorieGoal = computed(() => profileStore.profile?.calorieGoal ?? 2000);
const proteinGoal = computed(() => profileStore.profile?.proteinGoal ?? 0);
const carbsGoal = computed(() => profileStore.profile?.carbsGoal ?? 0);
const fatGoal = computed(() => profileStore.profile?.fatGoal ?? 0);

const showNudge = computed(() => !profileStore.profile?.calorieGoal);

onMounted(() => {
    journalStore.fetchDay(today);
    journalStore.fetchWeek(today);
    if (!profileStore.profile) {
        profileStore.fetchProfile();
    }
});
</script>

<template>
    <div class="dashboard-page">
        <!-- Date -->
        <p class="date-label">{{ formattedDate }}</p>

        <!-- Calorie summary card -->
        <AppCard class="calorie-card">
            <div class="summary-layout">
                <CalorieRing
                    :consumed="journalStore.totals.calories"
                    :goal="calorieGoal"
                    :size="150"
                />
                <div class="macro-cols">
                    <MacroBar
                        label="PROT"
                        :current="journalStore.totals.protein"
                        :goal="proteinGoal"
                        :compact="true"
                    />
                    <MacroBar
                        label="GLUC"
                        :current="journalStore.totals.carbs"
                        :goal="carbsGoal"
                        :compact="true"
                    />
                    <MacroBar
                        label="LIP"
                        :current="journalStore.totals.fat"
                        :goal="fatGoal"
                        :compact="true"
                    />
                </div>
            </div>
        </AppCard>

        <!-- Week strip -->
        <SectionLabel class="section-label">CETTE SEMAINE</SectionLabel>
        <AppCard>
            <WeekPlanStrip :weekData="journalStore.weekData" :today="today" />
        </AppCard>

        <!-- Nudge if no calorie goal -->
        <AppCard
            v-if="showNudge"
            class="nudge-card"
            @click="router.push('/profile')"
        >
            <p class="nudge-text">Définissez votre objectif calorique</p>
            <span class="nudge-cta">Compléter mon profil →</span>
        </AppCard>

        <!-- Quick add -->
        <AppCard class="quick-add-card" @click="router.push('/journal')">
            <span class="quick-add-text">J'ai mangé quelque chose…</span>
            <span class="quick-add-arrow">→</span>
        </AppCard>
    </div>
</template>

<style scoped>
.dashboard-page {
    padding: 20px 16px 32px;
    display: flex;
    flex-direction: column;
    gap: 0;
}

.date-label {
    font-size: 12px;
    color: var(--color-muted);
    letter-spacing: 0.08em;
    text-align: center;
    margin: 0 0 16px;
    text-transform: uppercase;
}

/* Calorie card */
.calorie-card {
    margin-bottom: 0;
}

.summary-layout {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 16px;
}

.macro-cols {
    display: flex;
    gap: 16px;
    width: 100%;
}

/* Section label */
.section-label {
    display: block;
    margin: 20px 0 8px;
}

/* Quick add */
.quick-add-card {
    display: flex;
    align-items: center;
    justify-content: space-between;
    cursor: pointer;
    margin-top: 12px;
    transition: opacity 0.15s;
}

.quick-add-card:hover {
    opacity: 0.8;
}

.quick-add-text {
    font-size: 14px;
    color: var(--color-muted);
    font-style: italic;
}

.quick-add-arrow {
    font-size: 16px;
    color: var(--color-accent);
}

/* Nudge */
.nudge-card {
    cursor: pointer;
    margin-top: 12px;
    display: flex;
    flex-direction: column;
    gap: 4px;
    transition: opacity 0.15s;
    border-color: var(--color-accent);
}

.nudge-card:hover {
    opacity: 0.8;
}

.nudge-text {
    font-size: 13px;
    color: var(--color-text);
    margin: 0;
}

.nudge-cta {
    font-size: 12px;
    color: var(--color-accent);
}
</style>
