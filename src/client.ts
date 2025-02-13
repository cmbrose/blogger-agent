import { Chat, Client } from '@agent/openai';

const OLLAMA_ENDPOINT = `http://localhost:11434/v1/chat/completions`;

const LLAMA_3_2: Client = {
    // @ts-expect-error; overloaded types always cause issues -.-
    async chat(input: Chat.Request, _signal?: AbortSignal): Promise<Chat.Output> {
        let response = await fetch(OLLAMA_ENDPOINT, {
            method: 'POST',
            body: JSON.stringify({
                ...input,
                stream: false,
                model: 'llama3.3',
            }),
        });
        const responseBody = await response.json();

        return responseBody;
    },
};

export const getClient = (): Client => {
    return LLAMA_3_2;
};