import { DynamicStructuredTool } from "@langchain/core/tools";
import type { Recipe } from "@mealplanner/shared-all";
import { libraryService, RecipeType } from "@mealplanner/shared-all";
import { z } from "zod";
import { AgentTool } from "./types.js";

const readLibrarySchema = z.object({
    recipeType: z
        .enum(RecipeType)
        .optional()
        .describe(
            `Optional recipe type filter (${Object.values(RecipeType).join(
                " | "
            )})`
        ),
    limit: z
        .number()
        .optional()
        .describe(
            "Optional limit on number of recipes to return (default: all recipes in library)"
        ),
});

const recipeTypeDescription = Object.values(RecipeType).join(", ");

export const getReadLibraryTool = (
    token: string
): AgentTool<typeof readLibrarySchema> => {
    return {
        schema: readLibrarySchema,
        tool: new DynamicStructuredTool({
            name: "read_library",
            description: `Reads all recipes from the library or filters by recipe type. Valid recipe types are: ${recipeTypeDescription}. Returns recipes from library sorted by creation date (newest first).`,
            schema: readLibrarySchema,
            func: async (input): Promise<string> => {
                console.log(
                    `Executing readLibraryTool with input: ${JSON.stringify(
                        input
                    )}`
                );
                try {
                    console.log(`Fetching library with token: ${token}`);
                    const library = await libraryService.fetchLibrary(token);
                    console.log(`Fetched ${library.length} recipes in library`);

                    let filteredLibrary = input.recipeType
                        ? library.filter((m: Recipe) =>
                              m.recipeTypes.includes(input.recipeType!)
                          )
                        : library;

                    if (input.limit && input.limit > 0) {
                        filteredLibrary = filteredLibrary.slice(0, input.limit);
                    }

                    if (filteredLibrary.length === 0) {
                        const filterText = input.recipeType
                            ? ` for ${input.recipeType}`
                            : "";
                        console.log(
                            `No recipes found${filterText} in the library.`
                        );
                        return `No recipes found${filterText} in your library.`;
                    }

                    // Format output for better readability
                    let output = `Found ${filteredLibrary.length} recipe${
                        filteredLibrary.length > 1 ? "s" : ""
                    } in your library`;
                    if (input.recipeType) {
                        output += ` (${input.recipeType})`;
                    }
                    output += ":\n\n";

                    filteredLibrary.forEach((recipe: Recipe, index: number) => {
                        output += `${index + 1}. **${recipe.name}** (${
                            recipe.recipeTypes
                        })\n`;
                        output += `   ID: ${recipe.id}\n`;
                        if (recipe.description) {
                            output += `   Description: ${recipe.description}\n`;
                        }
                        output += `   Added: ${recipe.createdAt.toLocaleDateString()}\n\n`;
                    });

                    console.log(
                        `Read library tool executed with input: ${JSON.stringify(
                            input
                        )}`
                    );
                    return output;
                } catch (error: any) {
                    console.error("Error in readLibraryTool:", error);
                    return `Error reading library: ${error.message}`;
                }
            },
        }),
    };
};
