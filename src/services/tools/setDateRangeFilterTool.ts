import { useDateFilterStore } from "@/stores/dateFilterStore";
import { DynamicStructuredTool } from "@langchain/core/tools";
import { z } from "zod";

// Schema for setting date range filter
const setDateRangeFilterSchema = z.object({
    action: z
        .enum([
            "set_range",
            "set_today",
            "set_this_week",
            "set_this_month",
            "set_last_30_days",
            "clear",
        ])
        .describe("The action to perform on the date filter"),
    startDate: z
        .string()
        .optional()
        .describe(
            "Start date in YYYY-MM-DD format (required for 'set_range' action)"
        ),
    endDate: z
        .string()
        .optional()
        .describe(
            "End date in YYYY-MM-DD format (required for 'set_range' action)"
        ),
});

export const SetDateRangeFilterTool = new DynamicStructuredTool({
    name: "set_date_range_filter",
    description: `Sets the date range filter for meal viewing. Available actions:
- 'set_range': Set custom date range (requires startDate and endDate)
- 'set_today': Filter to today's meals only
- 'set_this_week': Filter to current week's meals
- 'set_this_month': Filter to current month's meals  
- 'set_last_30_days': Filter to last 30 days of meals
- 'clear': Remove date filter to show all meals`,
    schema: setDateRangeFilterSchema,
    func: async (
        input: z.infer<typeof setDateRangeFilterSchema>
    ): Promise<string> => {
        const dateFilterStore = useDateFilterStore();

        try {
            switch (input.action) {
                case "set_range":
                    if (!input.startDate || !input.endDate) {
                        return "Error: Both startDate and endDate are required for 'set_range' action.";
                    }

                    const startDate = new Date(input.startDate);
                    const endDate = new Date(input.endDate);

                    if (
                        isNaN(startDate.getTime()) ||
                        isNaN(endDate.getTime())
                    ) {
                        return "Error: Invalid date format. Please use YYYY-MM-DD format.";
                    }

                    if (startDate > endDate) {
                        return "Error: Start date cannot be after end date.";
                    }

                    dateFilterStore.setDateRange(startDate, endDate);
                    return `Date filter set to range from ${startDate.toDateString()} to ${endDate.toDateString()}. Now showing meals within this date range.`;

                case "set_today":
                    dateFilterStore.setToday();
                    return "Date filter set to today. Now showing only today's meals.";

                case "set_this_week":
                    dateFilterStore.setThisWeek();
                    return "Date filter set to this week. Now showing meals from the current week.";

                case "set_this_month":
                    dateFilterStore.setThisMonth();
                    return "Date filter set to this month. Now showing meals from the current month.";

                case "set_last_30_days":
                    dateFilterStore.setLast30Days();
                    return "Date filter set to last 30 days. Now showing meals from the past 30 days.";

                case "clear":
                    dateFilterStore.clearDateRange();
                    return "Date filter cleared. Now showing all meals regardless of date.";

                default:
                    return `Error: Unknown action '${input.action}'. Valid actions are: set_range, set_today, set_this_week, set_this_month, set_last_30_days, clear.`;
            }
        } catch (error: any) {
            console.error("Error in setDateRangeFilterTool:", error);
            return `Error setting date filter: ${error.message}`;
        }
    },
});
