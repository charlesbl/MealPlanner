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
      };

export type ToolUpdateEventType = ToolUpdateEvent["type"];

export interface ChatModelStreamEventData {
    type: "stream";
    chunk: string;
}

export interface ChainEndEventData {
    type: "end";
    finalOutput: string;
}

export interface ToolCallEventData {
    type: "toolStart";
    toolData: {
        name: string;
        updateEvent?: ToolUpdateEvent;
    };
}

export interface ToolEndEventData {
    type: "toolEnd";
    toolData: {
        name: string;
        updateEvent?: ToolUpdateEvent;
    };
}

export type StreamEventData =
    | ChatModelStreamEventData
    | ChainEndEventData
    | ToolCallEventData
    | ToolEndEventData;
