<template>
    <div class="widgets-container">
        <div v-if="visibleWidgets.length === 0" class="no-widgets">
            <p>No widgets to display. The chat agent can show widgets here.</p>
        </div>

        <transition-group name="widget" tag="div" class="widgets-list">
            <div
                v-for="widget in visibleWidgets"
                :key="widget.id"
                class="widget-wrapper"
            >
                <div class="widget-header">
                    <span class="widget-title">{{
                        getWidgetTitle(widget)
                    }}</span>
                    <button
                        @click="hideWidget(widget.id)"
                        class="close-btn"
                        title="Hide widget"
                    >
                        ✕
                    </button>
                </div>

                <component
                    :is="getWidgetComponent(widget.type)"
                    v-bind="widget.props"
                    class="widget-content"
                />
            </div>
        </transition-group>
    </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { useWidgetsStore, WidgetType } from "../stores/widgetsStore";
import Calendar from "./widgets/Calendar.vue";
import Meal from "./widgets/Meal.vue";
import MealList from "./widgets/MealList.vue";

const widgetsStore = useWidgetsStore();

// Computed properties
const visibleWidgets = computed(() => widgetsStore.getVisibleWidgets());

// Methods
function getWidgetComponent(type: WidgetType) {
    switch (type) {
        case WidgetType.Calendar:
            return Calendar;
        case WidgetType.MealList:
            return MealList;
        case WidgetType.Meal:
            return Meal;
        default:
            return null;
    }
}

function getWidgetTitle(widget: any): string {
    switch (widget.type) {
        case WidgetType.Calendar:
            return "Meal Calendar";
        case WidgetType.MealList:
            return widget.props?.title || "Meal List";
        case WidgetType.Meal:
            return widget.props?.meal?.name || "Meal Details";
        default:
            return "Widget";
    }
}

function hideWidget(widgetId: string) {
    widgetsStore.hideWidget(widgetId);
}
</script>

<style scoped>
.widgets-container {
    flex: 1;
    padding: 20px;
    background: #f8f9fa;
    overflow-y: auto;
    min-width: 400px;
}

.no-widgets {
    display: flex;
    align-items: center;
    justify-content: center;
    height: 100%;
    color: #666;
    font-style: italic;
}

.widgets-list {
    display: flex;
    flex-direction: column;
    gap: 20px;
}

.widget-wrapper {
    background: white;
    border-radius: 8px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    overflow: hidden;
}

.widget-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 12px 16px;
    background: #f1f3f4;
    border-bottom: 1px solid #e0e0e0;
}

.widget-title {
    font-weight: 600;
    color: #333;
    font-size: 0.95em;
}

.close-btn {
    background: none;
    border: none;
    color: #666;
    cursor: pointer;
    padding: 4px 8px;
    border-radius: 4px;
    font-size: 14px;
    transition: all 0.2s;
}

.close-btn:hover {
    background: #e9ecef;
    color: #333;
}

.widget-content {
    padding: 0;
}

/* Widget animations */
.widget-enter-active,
.widget-leave-active {
    transition: all 0.3s ease;
}

.widget-enter-from {
    opacity: 0;
    transform: translateY(-20px);
}

.widget-leave-to {
    opacity: 0;
    transform: translateY(-20px);
}

.widget-move {
    transition: transform 0.3s ease;
}

/* Responsive design */
@media (max-width: 768px) {
    .widgets-container {
        min-width: 300px;
        padding: 10px;
    }

    .widgets-list {
        gap: 15px;
    }

    .widget-header {
        padding: 10px 12px;
    }
}
</style>
