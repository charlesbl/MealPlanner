import { Meal, MealType, WeekMeal, generateId } from "@mealplanner/shared";

// Simple in-memory stores (reset on server restart)
const meals: Meal[] = [];
const weekSelected: WeekMeal[] = [];

export const mealStore = {
    addMeal(name: string, description: string, mealTypes: MealType[]): string {
        const id = generateId();
        meals.push({
            id,
            name: name.trim(),
            description: description.trim(),
            mealTypes,
            createdAt: new Date(),
        });
        return id;
    },
    updateMeal(
        id: string,
        updates: Partial<Omit<Meal, "id" | "createdAt">>
    ): boolean {
        const idx = meals.findIndex((m) => m.id === id);
        if (idx === -1) return false;
        meals[idx] = { ...meals[idx], ...updates } as Meal;
        return true;
    },
    deleteMeal(id: string): boolean {
        const idx = meals.findIndex((m) => m.id === id);
        if (idx === -1) return false;
        meals.splice(idx, 1);
        // Also remove from week
        for (let i = weekSelected.length - 1; i >= 0; i--) {
            if (weekSelected[i].mealId === id) weekSelected.splice(i, 1);
        }
        return true;
    },
    getMealById(id: string): Meal | undefined {
        return meals.find((m) => m.id === id);
    },
    getMealsByType(mealType: MealType): Meal[] {
        return meals
            .filter((m) => m.mealTypes.includes(mealType))
            .slice()
            .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
    },
    getAllMeals(): Meal[] {
        return meals
            .slice()
            .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
    },
};

export const weekStore = {
    addMealToWeek(mealId: string): string {
        const id = generateId();
        const order = weekSelected.length;
        weekSelected.push({ id, mealId, addedAt: new Date(), order });
        return id;
    },
    removeMealFromWeek(mealId: string): boolean {
        const idx = weekSelected.findIndex((w) => w.mealId === mealId);
        if (idx === -1) return false;
        weekSelected.splice(idx, 1);
        return true;
    },
    isMealInWeek(mealId: string): boolean {
        return weekSelected.some((w) => w.mealId === mealId);
    },
    selectedMealCount(): number {
        return weekSelected.length;
    },
    getSelectedMealsWithData(): Array<Meal & { weekId: string }> {
        return weekSelected
            .slice()
            .sort((a, b) => a.order - b.order)
            .map((w) => {
                const meal = meals.find((m) => m.id === w.mealId);
                if (!meal) return undefined as any;
                return { ...meal, weekId: w.id };
            })
            .filter(Boolean);
    },
};
