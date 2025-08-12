import { DynamicStructuredTool } from "@langchain/core/tools";
import { ToolUpdateEvent, ToolUpdateEventType } from "@mealplanner/shared";
import z, { ZodObject } from "zod";

export interface AgentTool<T extends ZodObject> {
    schema: T;
    tool: DynamicStructuredTool<T>;
    getToolUpdateEventOnToolStart?: (input: z.infer<T>) => ToolUpdateEvent | undefined;
    getToolUpdateEventOnToolEnd?: (input:  z.infer<T>, output?: string) => ToolUpdateEvent | undefined;
}
