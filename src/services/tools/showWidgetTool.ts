import { DynamicStructuredTool } from "@langchain/core/tools";
import { z } from "zod";
import { MealType } from "../../stores/mealStore";
import { useWidgetsStore, WidgetType } from "../../stores/widgetsStore";

// Schema for showing a widget
const showWidgetSchema = z.object({
    type: z
        .enum(["meal-deck", "week-view", "meal-list", "meal"])
        .describe(
            "The type of widget to show. Options: meal-deck (shows all meals as cards in a deck view), week-view (shows selected meals for the current week), meal-list (shows list of meals with filters), meal (shows details of a specific meal)"
        ),
    title: z
        .string()
        .optional()
        .describe("Optional title for the widget (mainly for meal-list)"),
    mealType: z
        .nativeEnum(MealType)
        .optional()
        .describe(
            `Optional meal type filter for meal-deck or meal-list widget (${Object.values(
                MealType
            ).join(" | ")})`
        ),
    mealId: z
        .string()
        .optional()
        .describe("Required meal ID for showing individual meal widget"),
    limit: z
        .number()
        .optional()
        .describe("Optional limit for meal-list pagination (default: 10)"),
    showFilters: z
        .boolean()
        .optional()
        .describe(
            "Whether to show filter controls in meal-deck or meal-list (default: true)"
        ),
    showPagination: z
        .boolean()
        .optional()
        .describe("Whether to show pagination in meal-deck or meal-list (default: true)"),
});

export const ShowWidgetTool = new DynamicStructuredTool({
    name: "show_widget",
    description: `Display a widget in the UI. Can show meal deck (all meals as cards), week view (selected meals for the week), a filtered list of meals, or details of a specific meal. Use 'meal-deck' to browse all meals as cards, 'week-view' to manage weekly selection, 'meal-list' for filtered meal lists, or 'meal' for individual meal details (requires mealId).`,
    schema: showWidgetSchema,
    func: async (input: z.infer<typeof showWidgetSchema>): Promise<string> => {
        const widgetsStore = useWidgetsStore();

        try {
            let widgetType: WidgetType;
            let props: Record<string, any> = {};

            switch (input.type) {
                case "meal-deck":
                    widgetType = WidgetType.MealDeck;
                    props = {
                        mealType: input.mealType,
                        showFilters: input.showFilters,
                        showPagination: input.showPagination,
                    };
                    break;
                case "week-view":
                    widgetType = WidgetType.WeekView;
                    break;
                case "meal-list":
                    widgetType = WidgetType.MealList;
                    props = {
                        title: input.title,
                        mealType: input.mealType,
                        limit: input.limit,
                        showFilters: input.showFilters,
                        showPagination: input.showPagination,
                    };
                    break;
                case "meal":
                    if (!input.mealId) {
                        return "Error: mealId is required when showing individual meal widget.";
                    }
                    widgetType = WidgetType.Meal;
                    props = {
                        mealId: input.mealId,
                    };
                    break;
                default:
                    return `Error: Unknown widget type '${input.type}'. Valid types are: meal-deck, week-view, meal-list, meal.`;
            }

            // Remove undefined properties
            Object.keys(props).forEach(
                (key) => props[key] === undefined && delete props[key]
            );

            widgetsStore.showWidget(widgetType, props);

            let message = `Successfully displayed ${input.type} widget.`;

            if (input.type === "meal-deck" || input.type === "meal-list") {
                const filters = [];
                if (input.mealType)
                    filters.push(`meal type: ${input.mealType}`);
                if (filters.length > 0) {
                    message += ` Filtered by ${filters.join(", ")}.`;
                }
            } else if (input.type === "meal") {
                message += ` Showing meal with ID: ${input.mealId}.`;
            } else if (input.type === "week-view") {
                message += ` You can now manage your weekly meal selection.`;
            }

            return message;
        } catch (error: any) {
            console.error("Error in showWidgetTool:", error);
            return `Error displaying widget: ${error.message}`;
        }
    },
});
