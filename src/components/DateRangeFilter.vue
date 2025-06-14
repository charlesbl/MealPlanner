<script setup lang="ts">
import { useDateFilterStore } from "@/stores/dateFilterStore";
import { computed, ref } from "vue";

const dateFilterStore = useDateFilterStore();

// Local state
const showPresets = ref(false);

// Computed properties
const formattedStartDate = computed({
    get: () => {
        if (dateFilterStore.startDate) {
            return dateFilterStore.startDate.toISOString().split("T")[0];
        }
        return "";
    },
    set: (value: string) => {
        if (value) {
            dateFilterStore.setStartDate(new Date(value));
        } else {
            dateFilterStore.setStartDate(null);
        }
    },
});

const formattedEndDate = computed({
    get: () => {
        if (dateFilterStore.endDate) {
            return dateFilterStore.endDate.toISOString().split("T")[0];
        }
        return "";
    },
    set: (value: string) => {
        if (value) {
            dateFilterStore.setEndDate(new Date(value));
        } else {
            dateFilterStore.setEndDate(null);
        }
    },
});

// Methods
function clearFilter() {
    dateFilterStore.clearDateRange();
}

function togglePresets() {
    showPresets.value = !showPresets.value;
}

function selectPreset(presetFn: () => void) {
    presetFn();
    showPresets.value = false;
}
</script>

<template>
    <div class="date-range-filter">
        <div class="filter-header">
            <label class="filter-label">Date Range:</label>
            <button
                v-if="dateFilterStore.isDateRangeActive"
                @click="clearFilter"
                class="clear-btn"
                title="Clear date filter"
            >
                ✕
            </button>
        </div>

        <div class="date-inputs">
            <div class="date-input-group">
                <label for="start-date">From:</label>
                <input
                    id="start-date"
                    v-model="formattedStartDate"
                    type="date"
                    class="date-input"
                />
            </div>

            <div class="date-input-group">
                <label for="end-date">To:</label>
                <input
                    id="end-date"
                    v-model="formattedEndDate"
                    type="date"
                    class="date-input"
                />
            </div>

            <div class="preset-dropdown">
                <button @click="togglePresets" class="preset-btn">
                    Quick Select ▼
                </button>

                <div v-if="showPresets" class="preset-menu">
                    <button
                        @click="selectPreset(dateFilterStore.setToday)"
                        class="preset-item"
                    >
                        Today
                    </button>
                    <button
                        @click="selectPreset(dateFilterStore.setThisWeek)"
                        class="preset-item"
                    >
                        This Week
                    </button>
                    <button
                        @click="selectPreset(dateFilterStore.setThisMonth)"
                        class="preset-item"
                    >
                        This Month
                    </button>
                    <button
                        @click="selectPreset(dateFilterStore.setLast30Days)"
                        class="preset-item"
                    >
                        Last 30 Days
                    </button>
                </div>
            </div>
        </div>

        <div v-if="dateFilterStore.hasValidDateRange" class="active-filter">
            <span class="filter-text">{{ dateFilterStore.dateRangeText }}</span>
        </div>
    </div>
</template>

<style scoped>
.date-range-filter {
    border: 1px solid #ddd;
    border-radius: 6px;
    padding: 1rem;
    background: #f9f9f9;
    margin-bottom: 1rem;
}

.filter-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 0.75rem;
}

.filter-label {
    font-weight: 600;
    color: #333;
    margin: 0;
}

.clear-btn {
    background: #ff4444;
    color: white;
    border: none;
    border-radius: 50%;
    width: 24px;
    height: 24px;
    cursor: pointer;
    font-size: 0.8rem;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: background-color 0.2s;
}

.clear-btn:hover {
    background: #cc0000;
}

.date-inputs {
    display: flex;
    gap: 1rem;
    align-items: end;
    flex-wrap: wrap;
}

.date-input-group {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
}

.date-input-group label {
    font-size: 0.85rem;
    font-weight: 500;
    color: #555;
}

.date-input {
    padding: 0.5rem;
    border: 1px solid #ccc;
    border-radius: 4px;
    background: white;
    font-size: 0.9rem;
    min-width: 140px;
}

.date-input:focus {
    outline: none;
    border-color: #4caf50;
    box-shadow: 0 0 0 2px rgba(76, 175, 80, 0.2);
}

.preset-dropdown {
    position: relative;
}

.preset-btn {
    background: #666;
    color: white;
    border: none;
    padding: 0.5rem 1rem;
    border-radius: 4px;
    cursor: pointer;
    font-size: 0.85rem;
    transition: background-color 0.2s;
}

.preset-btn:hover {
    background: #555;
}

.preset-menu {
    position: absolute;
    top: 100%;
    left: 0;
    background: white;
    border: 1px solid #ddd;
    border-radius: 4px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
    z-index: 1000;
    min-width: 140px;
    margin-top: 0.25rem;
}

.preset-item {
    display: block;
    width: 100%;
    padding: 0.75rem 1rem;
    border: none;
    background: none;
    text-align: left;
    cursor: pointer;
    font-size: 0.9rem;
    transition: background-color 0.2s;
}

.preset-item:hover {
    background: #f5f5f5;
}

.preset-item:first-child {
    border-radius: 4px 4px 0 0;
}

.preset-item:last-child {
    border-radius: 0 0 4px 4px;
}

.active-filter {
    margin-top: 0.75rem;
    padding: 0.5rem;
    background: #e8f5e8;
    border: 1px solid #4caf50;
    border-radius: 4px;
    text-align: center;
}

.filter-text {
    font-weight: 500;
    color: #2e7d32;
    font-size: 0.9rem;
}

/* Responsive adjustments */
@media (max-width: 768px) {
    .date-inputs {
        flex-direction: column;
        align-items: stretch;
    }

    .date-input {
        min-width: 100%;
    }

    .preset-dropdown {
        width: 100%;
    }

    .preset-btn {
        width: 100%;
    }
}
</style>
