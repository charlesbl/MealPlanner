import { defineStore } from "pinia";
import { reactive } from "vue";

export enum WidgetType {
    Calendar = "Calendar",
    MealList = "MealList",
    Meal = "Meal",
}

export interface Widget {
    id: string;
    type: WidgetType;
    visible: boolean;
    props?: Record<string, any>;
    order: number;
}

export interface WidgetsState {
    widgets: Widget[];
}

export const useWidgetsStore = defineStore("widgets", () => {
    const state = reactive<WidgetsState>({
        widgets: [],
    });

    // Helper function to generate unique ID
    function generateId(): string {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    } // Show a widget (only one widget can be visible at a time)
    function showWidget(type: WidgetType, props?: Record<string, any>): string {
        // Hide all currently visible widgets first
        state.widgets.forEach((widget) => {
            widget.visible = false;
        });

        // Check if widget of this type already exists
        const existingWidget = state.widgets.find((w) => w.type === type);

        if (existingWidget) {
            // Update existing widget and make it visible
            existingWidget.visible = true;
            existingWidget.props = props || {};
            return existingWidget.id;
        } else {
            // Create new widget
            const newWidget: Widget = {
                id: generateId(),
                type,
                visible: true,
                props: props || {},
                order: state.widgets.length,
            };
            state.widgets.push(newWidget);
            return newWidget.id;
        }
    }

    // Hide a widget
    function hideWidget(widgetId: string) {
        const widget = state.widgets.find((w) => w.id === widgetId);
        if (widget) {
            widget.visible = false;
        }
    }

    // Hide widget by type
    function hideWidgetByType(type: WidgetType) {
        const widget = state.widgets.find((w) => w.type === type);
        if (widget) {
            widget.visible = false;
        }
    }

    // Remove a widget completely
    function removeWidget(widgetId: string) {
        const index = state.widgets.findIndex((w) => w.id === widgetId);
        if (index !== -1) {
            state.widgets.splice(index, 1);
        }
    }

    // Get visible widgets
    function getVisibleWidgets(): Widget[] {
        return state.widgets
            .filter((w) => w.visible)
            .sort((a, b) => a.order - b.order);
    }

    // Clear all widgets
    function clearAllWidgets() {
        state.widgets = [];
    }

    // Update widget props
    function updateWidgetProps(widgetId: string, props: Record<string, any>) {
        const widget = state.widgets.find((w) => w.id === widgetId);
        if (widget) {
            widget.props = { ...widget.props, ...props };
        }
    }

    return {
        // State
        widgets: state.widgets,

        // Actions
        showWidget,
        hideWidget,
        hideWidgetByType,
        removeWidget,
        getVisibleWidgets,
        clearAllWidgets,
        updateWidgetProps,
    };
});
