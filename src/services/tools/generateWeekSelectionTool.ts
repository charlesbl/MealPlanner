import { DynamicStructuredTool } from "@langchain/core/tools";
import { z } from 'zod';
import { useWeekStore } from '@/stores/weekStore';
import { useMealStore, MealType } from '@/stores/mealStore';

// Schema for generating a week selection
const generateWeekSelectionSchema = z.object({
    totalMeals: z.number().min(1).max(21).describe("Total number of meals to select for the week (1-21)"),
    useDistribution: z.boolean().optional().describe("Whether to use specific distribution by meal type (default: false for random selection)"),
    breakfastCount: z.number().min(0).optional().describe("Number of breakfast meals (only used if useDistribution is true)"),
    lunchCount: z.number().min(0).optional().describe("Number of lunch meals (only used if useDistribution is true)"),
    dinnerCount: z.number().min(0).optional().describe("Number of dinner meals (only used if useDistribution is true)"),
    snacksCount: z.number().min(0).optional().describe("Number of snack meals (only used if useDistribution is true)"),
    clearExisting: z.boolean().optional().describe("Whether to clear the existing weekly selection before generating (default: true)"),
});

export const GenerateWeekSelectionTool = new DynamicStructuredTool({
  name: "generate_week_selection",
  description: `Automatically generates a weekly meal selection from your deck. Can either select meals randomly or use a specific distribution by meal type. Valid meal types are: ${Object.values(MealType).join(', ')}. This will replace your current weekly selection unless clearExisting is set to false.`,
  schema: generateWeekSelectionSchema,
  func: async (input: z.infer<typeof generateWeekSelectionSchema>): Promise<string> => {
    const weekStore = useWeekStore();
    const mealStore = useMealStore();
    
    try {
      const allMeals = mealStore.getAllMeals();
      
      if (allMeals.length === 0) {
        return "Cannot generate weekly selection: You have no meals in your deck. Please create some meals first using the add_or_update_meal tool.";
      }
      
      if (allMeals.length < input.totalMeals) {
        return `Cannot generate selection: You requested ${input.totalMeals} meals but only have ${allMeals.length} meals in your deck. Please reduce the number or create more meals.`;
      }
      
      // Validate distribution if specified
      if (input.useDistribution) {
        const breakfastCount = input.breakfastCount || 0;
        const lunchCount = input.lunchCount || 0;
        const dinnerCount = input.dinnerCount || 0;
        const snacksCount = input.snacksCount || 0;
        
        const distributionTotal = breakfastCount + lunchCount + dinnerCount + snacksCount;
        
        if (distributionTotal !== input.totalMeals) {
          return `Error: Distribution total (${distributionTotal}) doesn't match requested total meals (${input.totalMeals}). Please adjust the distribution.`;
        }
        
        // Check if we have enough meals of each type
        const availableBreakfast = mealStore.getMealsByType(MealType.Breakfast).length;
        const availableLunch = mealStore.getMealsByType(MealType.Lunch).length;
        const availableDinner = mealStore.getMealsByType(MealType.Dinner).length;
        const availableSnacks = mealStore.getMealsByType(MealType.Snacks).length;
        
        const insufficientTypes = [];
        if (breakfastCount > availableBreakfast) insufficientTypes.push(`Breakfast (need ${breakfastCount}, have ${availableBreakfast})`);
        if (lunchCount > availableLunch) insufficientTypes.push(`Lunch (need ${lunchCount}, have ${availableLunch})`);
        if (dinnerCount > availableDinner) insufficientTypes.push(`Dinner (need ${dinnerCount}, have ${availableDinner})`);
        if (snacksCount > availableSnacks) insufficientTypes.push(`Snacks (need ${snacksCount}, have ${availableSnacks})`);
        
        if (insufficientTypes.length > 0) {
          return `Error: Insufficient meals for requested distribution. ${insufficientTypes.join(', ')}. Please adjust the distribution or create more meals.`;
        }
        
        // Generate with distribution
        const distribution = {
          [MealType.Breakfast]: breakfastCount,
          [MealType.Lunch]: lunchCount,
          [MealType.Dinner]: dinnerCount,
          [MealType.Snacks]: snacksCount,
        };
        
        weekStore.generateWeekSelection(input.totalMeals, distribution);
        
        const selectedMeals = weekStore.getSelectedMealsWithData();
        const typeBreakdown = selectedMeals.reduce((acc, meal) => {
          acc[meal.mealType] = (acc[meal.mealType] || 0) + 1;
          return acc;
        }, {} as Record<string, number>);
        
        const breakdownText = Object.entries(typeBreakdown)
          .map(([type, count]) => `${count} ${type}`)
          .join(', ');
        
        return `Successfully generated weekly selection with ${input.totalMeals} meals using specified distribution: ${breakdownText}. Your weekly selection is now ready!`;
        
      } else {
        // Generate random selection
        weekStore.generateWeekSelection(input.totalMeals);
        
        const selectedMeals = weekStore.getSelectedMealsWithData();
        const typeBreakdown = selectedMeals.reduce((acc, meal) => {
          acc[meal.mealType] = (acc[meal.mealType] || 0) + 1;
          return acc;
        }, {} as Record<string, number>);
        
        const breakdownText = Object.entries(typeBreakdown)
          .map(([type, count]) => `${count} ${type}`)
          .join(', ');
        
        return `Successfully generated random weekly selection with ${input.totalMeals} meals: ${breakdownText}. Your weekly selection is now ready!`;
      }
      
    } catch (error: any) {
      console.error("Error in generateWeekSelectionTool:", error);
      return `Error generating weekly selection: ${error.message}`;
    }
  }
});
