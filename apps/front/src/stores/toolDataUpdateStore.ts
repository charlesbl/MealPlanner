import type { ToolUpdateEvent } from "@mealplanner/shared-all";
import { defineStore } from "pinia";
import { useLibraryStore } from "./libraryStore";
import { usePlanStore } from "./planStore";

export const useToolDataUpdateStore = defineStore("toolDataUpdateStore", () => {
    const libraryStore = useLibraryStore();
    const planStore = usePlanStore();
    const updateDataOnToolStart = async (
        toolDataUpdateEvent: ToolUpdateEvent
    ) => {
        switch (toolDataUpdateEvent.type) {
            case "updateLibrary":
            case "updateMeal":
            case "updatePlan":
            case "deleteMeal":
                break;
            default:
                console.error(
                    `Unknown tool update type on tool start: ${
                        (toolDataUpdateEvent as any).type
                    }`
                );
                break;
        }
    };
    const updateDataOnToolEnd = async (
        toolDataUpdateEvent: ToolUpdateEvent
    ) => {
        switch (toolDataUpdateEvent.type) {
            case "updateLibrary":
                await libraryStore.updateLibrary();
                break;
            case "updatePlan":
                await planStore.updatePlan();
                break;
            case "updateMeal":
                // TODO Handle meal update logic here
                console.log(
                    `Meal updated with ID: ${toolDataUpdateEvent.mealId}`
                );
                break;
            case "deleteMeal":
                console.log(
                    `Meal deleted with ID: ${toolDataUpdateEvent.mealId}`
                );
                await libraryStore.updateDeletedMeal(
                    toolDataUpdateEvent.mealId
                );
                break;
            default:
                console.error(
                    `Unknown tool update type on tool end: ${
                        (toolDataUpdateEvent as any).type
                    }`
                );
                break;
        }
    };
    return {
        updateDataOnToolStart,
        updateDataOnToolEnd,
    };
});
