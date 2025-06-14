import { defineStore } from "pinia";
import { computed, ref } from "vue";

export interface DateRange {
    startDate: Date | null;
    endDate: Date | null;
}

export const useDateFilterStore = defineStore("dateFilterStore", () => {
    // --- State ---
    const startDate = ref<Date | null>(null);
    const endDate = ref<Date | null>(null);
    const isDateRangeActive = ref(false);

    // --- Computed Properties ---
    const dateRange = computed<DateRange>(() => ({
        startDate: startDate.value,
        endDate: endDate.value,
    }));

    const hasValidDateRange = computed(() => {
        return (
            startDate.value && endDate.value && startDate.value <= endDate.value
        );
    });

    const dateRangeText = computed(() => {
        if (!hasValidDateRange.value) return "";

        const start = startDate.value!.toLocaleDateString();
        const end = endDate.value!.toLocaleDateString();
        return `${start} - ${end}`;
    });

    // --- Actions ---
    function setDateRange(start: Date | null, end: Date | null) {
        startDate.value = start;
        endDate.value = end;
        isDateRangeActive.value = !!(start && end);
    }

    function setStartDate(date: Date | null) {
        startDate.value = date;
        updateActiveState();
    }

    function setEndDate(date: Date | null) {
        endDate.value = date;
        updateActiveState();
    }

    function clearDateRange() {
        startDate.value = null;
        endDate.value = null;
        isDateRangeActive.value = false;
    }

    function setToday() {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        setDateRange(today, today);
    }

    function setThisWeek() {
        const today = new Date();
        const dayOfWeek = today.getDay();
        const start = new Date(today);
        start.setDate(today.getDate() - dayOfWeek);
        start.setHours(0, 0, 0, 0);

        const end = new Date(start);
        end.setDate(start.getDate() + 6);
        end.setHours(23, 59, 59, 999);

        setDateRange(start, end);
    }

    function setThisMonth() {
        const today = new Date();
        const start = new Date(today.getFullYear(), today.getMonth(), 1);
        const end = new Date(today.getFullYear(), today.getMonth() + 1, 0);
        end.setHours(23, 59, 59, 999);

        setDateRange(start, end);
    }

    function setLast30Days() {
        const today = new Date();
        today.setHours(23, 59, 59, 999);

        const start = new Date(today);
        start.setDate(today.getDate() - 30);
        start.setHours(0, 0, 0, 0);

        setDateRange(start, today);
    }

    // Helper function to update active state
    function updateActiveState() {
        isDateRangeActive.value = !!(startDate.value && endDate.value);
    }

    return {
        // State
        startDate,
        endDate,
        isDateRangeActive,

        // Computed
        dateRange,
        hasValidDateRange,
        dateRangeText,

        // Actions
        setDateRange,
        setStartDate,
        setEndDate,
        clearDateRange,
        setToday,
        setThisWeek,
        setThisMonth,
        setLast30Days,
    };
});
