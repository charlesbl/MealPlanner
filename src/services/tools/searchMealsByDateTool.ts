import { DynamicStructuredTool } from "@langchain/core/tools";
import { z } from 'zod';
import { useMealStore, MealType } from '@/stores/mealStore';

// Schema for searching meals by date
const searchMealsByDateSchema = z.object({
    date: z.string().describe("Date to search for meals in YYYY-MM-DD format"),
    mealType: z.nativeEnum(MealType).optional().describe(`Optional meal type filter (${Object.values(MealType).join(' | ')})`),
});

export const SearchMealsByDateTool = new DynamicStructuredTool({
  name: "search_meals_by_date",
  description: `Search for meals on a specific date. Optionally filter by meal type. Valid meal types are: ${Object.values(MealType).join(', ')}.`,
  schema: searchMealsByDateSchema,
  func: async (input: z.infer<typeof searchMealsByDateSchema>): Promise<string> => {
    const mealStore = useMealStore();
    try {
      const searchDate = new Date(input.date);
      let meals = mealStore.getMealsByDate(searchDate);
      
      if (input.mealType) {
        meals = meals.filter(meal => meal.mealType === input.mealType);
      }
      
      if (meals.length === 0) {
        const filterText = input.mealType ? ` (${input.mealType})` : '';
        return `No meals found for ${searchDate.toDateString()}${filterText}.`;
      }
      
      // Format output for better readability
      let output = `Found ${meals.length} meal${meals.length > 1 ? 's' : ''} for ${searchDate.toDateString()}`;
      if (input.mealType) {
        output += ` (${input.mealType})`;
      }
      output += ':\n\n';
      
      meals.forEach((meal, index) => {
        output += `${index + 1}. **${meal.name}** (${meal.mealType})\n`;
        output += `   ID: ${meal.id}\n`;
        if (meal.description) {
          output += `   Description: ${meal.description}\n`;
        }
        output += `   Added: ${meal.createdAt.toLocaleDateString()}\n\n`;
      });
      
      return output;
    } catch (error: any) {
      console.error("Error in searchMealsByDateTool:", error);
      return `Error searching meals by date: ${error.message}`;
    }
  }
});
