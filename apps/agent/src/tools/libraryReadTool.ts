import { DynamicStructuredTool } from "@langchain/core/tools";
import type { Meal } from "@mealplanner/shared-all";
import * as libraryService from "@mealplanner/shared-all";
import { MealType } from "@mealplanner/shared-all";
import { z } from "zod";
import { AgentTool } from "./types.js";

const readLibrarySchema = z.object({
    mealType: z
        .enum(MealType)
        .optional()
        .describe(
            `Optional meal type filter (${Object.values(MealType).join(" | ")})`
        ),
    limit: z
        .number()
        .optional()
        .describe(
            "Optional limit on number of meals to return (default: all meals in library)"
        ),
});

const mealTypeDescription = Object.values(MealType).join(", ");

export const getReadLibraryTool = (
    token: string
): AgentTool<typeof readLibrarySchema> => {
    return {
        schema: readLibrarySchema,
        tool: new DynamicStructuredTool({
            name: "read_library",
            description: `Reads all meals from the library or filters by meal type. Valid meal types are: ${mealTypeDescription}. Returns meals from library sorted by creation date (newest first).`,
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
                    console.log(`Fetched ${library.length} meals in library`);

                    let filteredLibrary = input.mealType
                        ? library.filter((m: Meal) =>
                              m.mealTypes.includes(input.mealType!)
                          )
                        : library;

                    if (input.limit && input.limit > 0) {
                        filteredLibrary = filteredLibrary.slice(0, input.limit);
                    }

                    if (filteredLibrary.length === 0) {
                        const filterText = input.mealType
                            ? ` for ${input.mealType}`
                            : "";
                        console.log(
                            `No meals found${filterText} in the library.`
                        );
                        return `No meals found${filterText} in your library.`;
                    }

                    // Format output for better readability
                    let output = `Found ${filteredLibrary.length} meal${
                        filteredLibrary.length > 1 ? "s" : ""
                    } in your library`;
                    if (input.mealType) {
                        output += ` (${input.mealType})`;
                    }
                    output += ":\n\n";

                    filteredLibrary.forEach((meal: Meal, index: number) => {
                        output += `${index + 1}. **${meal.name}** (${
                            meal.mealTypes
                        })\n`;
                        output += `   ID: ${meal.id}\n`;
                        if (meal.description) {
                            output += `   Description: ${meal.description}\n`;
                        }
                        output += `   Added: ${meal.createdAt.toLocaleDateString()}\n\n`;
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
