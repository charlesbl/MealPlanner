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
            case "updateRecipe":
            case "updatePlan":
            case "removeRecipe":
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
            case "updateRecipe":
                // TODO Handle recipe update logic here
                console.log(
                    `Recipe updated with ID: ${toolDataUpdateEvent.recipeId}`
                );
                break;
            case "removeRecipe":
                console.log(
                    `Recipe deleted with ID: ${toolDataUpdateEvent.recipeId}`
                );
                await libraryStore.updateDeletedRecipe(
                    toolDataUpdateEvent.recipeId
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
