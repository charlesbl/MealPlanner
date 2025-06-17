import { DynamicStructuredTool } from "@langchain/core/tools";
import { z } from "zod";
import { MealType } from "../../stores/mealStore";
import { useWidgetsStore, WidgetType } from "../../stores/widgetsStore";

// Schema for showing a widget
const showWidgetSchema = z.object({
    type: z
        .enum(["calendar", "meal-list", "meal"])
        .describe(
            "The type of widget to show. Options: calendar (shows meals in calendar view), meal-list (shows list of meals with filters), meal (shows details of a specific meal)"
        ),
    title: z
        .string()
        .optional()
        .describe("Optional title for the widget (mainly for meal-list)"),
    mealType: z
        .nativeEnum(MealType)
        .optional()
        .describe(
            `Optional meal type filter for meal-list widget (${Object.values(
                MealType
            ).join(" | ")})`
        ),
    date: z
        .string()
        .optional()
        .describe(
            "Optional date filter for meal-list widget (YYYY-MM-DD format)"
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
            "Whether to show filter controls in meal-list (default: true)"
        ),
    showPagination: z
        .boolean()
        .optional()
        .describe("Whether to show pagination in meal-list (default: true)"),
});

export const ShowWidgetTool = new DynamicStructuredTool({
    name: "show_widget",
    description: `Display a widget in the UI. Can show calendar view of meals, a filtered list of meals, or details of a specific meal. Use 'calendar' to show meals in calendar format, 'meal-list' to show a list of meals with optional filters, or 'meal' to show details of a specific meal (requires mealId).`,
    schema: showWidgetSchema,
    func: async (input: z.infer<typeof showWidgetSchema>): Promise<string> => {
        const widgetsStore = useWidgetsStore();

        try {
            let widgetType: WidgetType;
            let props: Record<string, any> = {};

            switch (input.type) {
                case "calendar":
                    widgetType = WidgetType.Calendar;
                    break;
                case "meal-list":
                    widgetType = WidgetType.MealList;
                    props = {
                        title: input.title,
                        mealType: input.mealType,
                        date: input.date,
                        limit: input.limit,
                        showFilters: input.showFilters,
                        showPagination: input.showPagination,
                    };
                    // Remove undefined properties
                    Object.keys(props).forEach(
                        (key) => props[key] === undefined && delete props[key]
                    );
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
                    return `Error: Unknown widget type '${input.type}'. Valid types are: calendar, meal-list, meal.`;
            }

            widgetsStore.showWidget(widgetType, props);

            let message = `Successfully displayed ${input.type} widget.`;

            if (input.type === "meal-list") {
                const filters = [];
                if (input.mealType)
                    filters.push(`meal type: ${input.mealType}`);
                if (input.date) filters.push(`date: ${input.date}`);
                if (filters.length > 0) {
                    message += ` Filtered by ${filters.join(", ")}.`;
                }
            } else if (input.type === "meal") {
                message += ` Showing meal with ID: ${input.mealId}.`;
            }

            return message;
        } catch (error: any) {
            console.error("Error in showWidgetTool:", error);
            return `Error displaying widget: ${error.message}`;
        }
    },
});
