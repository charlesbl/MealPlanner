export type ToolUpdateEvent =
    | {
          type: "updateLibrary";
      }
    | {
          type: "updateRecipe";
          recipeId: string;
      }
    | {
          type: "updatePlan";
      }
    | {
          type: "removeRecipe";
          recipeId: string;
      }
    | {
          type: "updateJournal";
          date: string;
      };

export type ToolUpdateEventType = ToolUpdateEvent["type"];

export interface ChatModelStartEventData {
    type: "streamStart";
    runId: string;
}

export interface ChatModelStreamEventData {
    type: "stream";
    chunk: string;
    runId: string;
}
export interface ChatModelEndEventData {
    type: "streamEnd";
    text: string;
    runId: string;
}

export interface ToolCallEventData {
    type: "toolStart";
    toolData: {
        name: string;
        updateEvent?: ToolUpdateEvent;
    };
    runId: string;
}

export interface ToolEndEventData {
    type: "toolEnd";
    toolData: {
        name: string;
        updateEvent?: ToolUpdateEvent;
    };
    runId: string;
}

export interface ChainEndEventData {
    type: "end";
    finalOutput: string;
}

export interface ThreadCreatedEventData {
    type: "threadCreated";
    threadId: string;
    title: string;
}

export interface ThreadTitleUpdatedEventData {
    type: "threadTitleUpdated";
    threadId: string;
    title: string;
}

export interface RecipeCardEventData {
    type: "recipeCard";
    recipe: {
        id: string;
        name: string;
        calories: number;
        protein: number;
        carbs: number;
        fat: number;
    };
}

export type StreamEventData =
    | ChatModelStartEventData
    | ChatModelStreamEventData
    | ChatModelEndEventData
    | ChainEndEventData
    | ToolCallEventData
    | ToolEndEventData
    | ThreadCreatedEventData
    | ThreadTitleUpdatedEventData
    | RecipeCardEventData;
