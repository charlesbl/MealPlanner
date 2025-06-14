/**
 * @fileoverview Stream Event Handlers - Handle different stream event types, process stream chunks
 * Role: Processes streaming events from the language model
 * Does: Handle chat model streams, chain events, tool events, and logging
 * Doesn't: Manage chat state, execute streaming logic, or handle persistence
 */

export interface StreamState {
    fullResponse: string;
}
export class StreamEventHandlerImpl {
    handleChatModelStreamEvent(event: any, state: StreamState): StreamState {
        if (event.data?.chunk?.content) {
            const chunk = event.data.chunk.content;
            if (typeof chunk === "string" && chunk.length > 0) {
                return {
                    fullResponse: state.fullResponse + chunk,
                };
            }
        }
        return state;
    }

    handleChainEndEvent(event: any, state: StreamState): StreamState {
        if (event.name === "AgentExecutor" && event.data?.output?.output) {
            const finalOutput = event.data.output.output;
            if (typeof finalOutput === "string") {
                // Only return if this is different from what we've streamed
                if (
                    finalOutput !== state.fullResponse &&
                    finalOutput.length > state.fullResponse.length
                ) {
                    const newContent = finalOutput.slice(
                        state.fullResponse.length
                    );
                    return {
                        fullResponse: newContent,
                    };
                }
            }
        }
        return state;
    }

    handleToolCallEvent(event: any, state: StreamState): StreamState {
        console.log(`Tool called: ${event.name}`, event.data);
        return state;
    }

    handleToolEndEvent(event: any, state: StreamState): StreamState {
        console.log(`Tool completed: ${event.name}`, event.data);
        return state;
    }

    handleUselessEvent(event: any, state: StreamState): StreamState {
        console.debug(`Useless event started: ${event.name}`, event.data);
        return state;
    }

    logUnhandledEvent(event: any, state: StreamState): StreamState {
        console.error(`Unhandled stream event: ${event.event}`, {
            name: event.name,
            runId: event.run_id,
            tags: event.tags,
            metadata: event.metadata,
            data: event.data,
        });
        return state;
    }
}

export const streamEventHandler = new StreamEventHandlerImpl();
