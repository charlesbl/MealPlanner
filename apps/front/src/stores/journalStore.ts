import {
    journalService,
    type FoodEntry,
    type NutritionInfo,
} from "@mealplanner/shared-all";
import { defineStore } from "pinia";
import { computed, ref } from "vue";
import { useAuthStore } from "./authStore";

function todayISO(): string {
    return new Date().toISOString().split("T")[0];
}

function getWeekStartISO(date: string): string {
    // Monday of the ISO week containing `date`
    const d = new Date(date + "T12:00:00");
    const day = d.getDay(); // 0=Sun
    const diff = day === 0 ? -6 : 1 - day;
    d.setDate(d.getDate() + diff);
    return d.toISOString().split("T")[0];
}

const EMPTY_TOTALS: NutritionInfo = {
    calories: 0,
    protein: 0,
    carbs: 0,
    fat: 0,
};

const POLL_INTERVAL_MS = 2000;

export const useJournalStore = defineStore("journalStore", () => {
    const auth = useAuthStore();

    const currentDate = ref<string>(todayISO());
    const entries = ref<FoodEntry[]>([]);
    const totals = ref<NutritionInfo>({ ...EMPTY_TOTALS });
    const weekData = ref<{ date: string; totals: NutritionInfo }[]>([]);
    const loadingDay = ref(false);
    const loadingWeek = ref(false);
    const adding = ref(false);

    const pollingInterval = ref<ReturnType<typeof setInterval> | null>(null);

    const hasPendingEntries = computed(() =>
        entries.value.some((e) => e.status === "pending"),
    );

    function stopPolling() {
        if (pollingInterval.value !== null) {
            clearInterval(pollingInterval.value);
            pollingInterval.value = null;
        }
    }

    function syncPolling() {
        if (hasPendingEntries.value) {
            if (pollingInterval.value === null) {
                pollingInterval.value = setInterval(() => {
                    void fetchDay(currentDate.value);
                }, POLL_INTERVAL_MS);
            }
        } else {
            stopPolling();
        }
    }

    async function fetchDay(date: string) {
        if (!auth.token) return;
        currentDate.value = date;
        loadingDay.value = true;
        try {
            const res = await journalService.fetchByDate(date, auth.token);
            entries.value = res.entries;
            totals.value = res.totals;
        } catch (e) {
            console.error("fetchDay error:", e);
        } finally {
            loadingDay.value = false;
        }
        syncPolling();
    }

    async function fetchWeek(date: string) {
        if (!auth.token) return;
        const startDate = getWeekStartISO(date);
        loadingWeek.value = true;
        try {
            const res = await journalService.fetchWeek(startDate, auth.token);
            // Pad to 7 items if needed
            const days = [...res.days];
            while (days.length < 7) {
                const d = new Date(startDate + "T12:00:00");
                d.setDate(d.getDate() + days.length);
                days.push({
                    date: d.toISOString().split("T")[0],
                    totals: { ...EMPTY_TOTALS },
                });
            }
            weekData.value = days;
        } catch (e) {
            console.error("fetchWeek error:", e);
        } finally {
            loadingWeek.value = false;
        }
    }

    async function addEntry(
        description: string,
        mealType: string,
        date?: string,
    ) {
        if (!auth.token) return;
        adding.value = true;
        try {
            const agentUrl = import.meta.env.VITE_AGENT_URL as string;
            const res = await fetch(`${agentUrl}/food-entries`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${auth.token}`,
                },
                body: JSON.stringify({
                    description,
                    date: date ?? currentDate.value,
                    mealType,
                }),
            });
            if (!res.ok)
                throw new Error(`Add food entry failed: ${res.status}`);
            // Fetch immediately to display the pending entry
            await fetchDay(date ?? currentDate.value);
        } catch (e) {
            console.error("addEntry error:", e);
            throw e;
        } finally {
            adding.value = false;
        }
    }

    async function retryEntry(id: string) {
        if (!auth.token) return;
        try {
            const agentUrl = import.meta.env.VITE_AGENT_URL as string;
            const res = await fetch(`${agentUrl}/food-entries/${id}/retry`, {
                method: "POST",
                headers: { Authorization: `Bearer ${auth.token}` },
            });
            if (!res.ok)
                throw new Error(`Retry food entry failed: ${res.status}`);
            await fetchDay(currentDate.value);
        } catch (e) {
            console.error("retryEntry error:", e);
        }
    }

    async function deleteEntry(id: string) {
        if (!auth.token) return;
        // Optimistic remove
        entries.value = entries.value.filter((e) => e.id !== id);
        totals.value = entries.value.reduce(
            (acc, e) => ({
                calories: acc.calories + e.nutrition.calories,
                protein: acc.protein + e.nutrition.protein,
                carbs: acc.carbs + e.nutrition.carbs,
                fat: acc.fat + e.nutrition.fat,
            }),
            { ...EMPTY_TOTALS },
        );
        try {
            await journalService.deleteFoodEntry(id, auth.token);
        } catch (e) {
            console.error("deleteEntry error:", e);
            // Re-fetch to restore state on error
            await fetchDay(currentDate.value);
        }
    }

    return {
        currentDate,
        entries,
        totals,
        weekData,
        loadingDay,
        loadingWeek,
        adding,
        hasPendingEntries,
        fetchDay,
        fetchWeek,
        addEntry,
        retryEntry,
        deleteEntry,
        stopPolling,
        todayISO,
        getWeekStartISO,
    };
});
