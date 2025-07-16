import { DynamicStructuredTool } from "@langchain/core/tools";
import { z } from 'zod';
import { useWeekStore } from '@/stores/weekStore';
import { MealType } from '@/stores/mealStore';

// Schema for reading week selection
const readWeekSelectionSchema = z.object({
    groupByType: z.boolean().optional().describe("Whether to group meals by type in the output (default: false)"),
    showDetails: z.boolean().optional().describe("Whether to include meal descriptions in the output (default: true)"),
});

export const ReadWeekSelectionTool = new DynamicStructuredTool({
  name: "read_week_selection",
  description: "Reads the current weekly meal selection. Shows all meals selected for the week with optional grouping by meal type.",
  schema: readWeekSelectionSchema,
  func: async (input: z.infer<typeof readWeekSelectionSchema>): Promise<string> => {
    const weekStore = useWeekStore();
    
    try {
      const selectedMeals = weekStore.getSelectedMealsWithData();
      
      if (selectedMeals.length === 0) {
        return "Your weekly selection is empty. You can add meals from your deck using the add_meal_to_week tool or generate an automatic selection using generate_week_selection.";
      }
      
      const showDetails = input.showDetails !== false; // Default to true
      const groupByType = input.groupByType || false;
      
      let output = `Your weekly selection contains ${selectedMeals.length} meal${selectedMeals.length > 1 ? 's' : ''}:\n\n`;
      
      if (groupByType) {
        // Group by meal type
        const mealsByType = weekStore.selectedMealsByType();
        const typeOrder = [MealType.Breakfast, MealType.Lunch, MealType.Dinner, MealType.Snacks];
        
        typeOrder.forEach(mealType => {
          const mealsOfType = mealsByType[mealType];
          if (mealsOfType && mealsOfType.length > 0) {
            output += `**${mealType} (${mealsOfType.length}):**\n`;
            mealsOfType.forEach((meal, index) => {
              output += `${index + 1}. ${meal.name}`;
              if (showDetails && meal.description) {
                const truncatedDesc = meal.description.length > 100 
                  ? meal.description.substring(0, 100) + "..."
                  : meal.description;
                output += ` - ${truncatedDesc}`;
              }
              output += `\n`;
            });
            output += `\n`;
          }
        });
      } else {
        // List in order
        selectedMeals.forEach((meal, index) => {
          output += `${index + 1}. **${meal.name}** (${meal.mealType})`;
          if (showDetails && meal.description) {
            const truncatedDesc = meal.description.length > 100 
              ? meal.description.substring(0, 100) + "..."
              : meal.description;
            output += `\n   ${truncatedDesc}`;
          }
          output += `\n\n`;
        });
      }
      
      // Add summary
      const typeBreakdown = selectedMeals.reduce((acc, meal) => {
        acc[meal.mealType] = (acc[meal.mealType] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);
      
      const breakdownText = Object.entries(typeBreakdown)
        .map(([type, count]) => `${count} ${type}`)
        .join(', ');
      
      output += `**Summary:** ${breakdownText}`;
      
      return output;
      
    } catch (error: any) {
      console.error("Error in readWeekSelectionTool:", error);
      return `Error reading weekly selection: ${error.message}`;
    }
  }
});
