import type { ToolUpdateEvent } from "@mealplanner/shared-all";
import { defineStore } from "pinia";
import { useMealStore } from "./mealStore";

export const useToolDataUpdateStore = defineStore("toolDataUpdateStore", () => {
    const mealStore = useMealStore();
    const updateDataOnToolStart = async (
        toolDataUpdateEvent: ToolUpdateEvent
    ) => {
        switch (toolDataUpdateEvent.type) {
            case "updateMeals":
            case "updateMeal":
            case "updateMealSelection":
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
            case "updateMeals":
                await mealStore.updateMeals();
                break;
            case "updateMeal":
                // TODO Handle meal update logic here
                console.log(
                    `Meal updated with ID: ${toolDataUpdateEvent.mealId}`
                );
                break;
            case "updateMealSelection":
                // TODO Handle meal selection update logic here
                console.log("Meal selection updated");
                break;
            case "deleteMeal":
                console.log(
                    `Meal deleted with ID: ${toolDataUpdateEvent.mealId}`
                );
                await mealStore.updateDeletedMeal(toolDataUpdateEvent.mealId);
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
