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

const CLIENT_NEXT_MODEL8: Client = {
    // @ts-expect-error; overloaded types always cause issues -.-
    async chat(input: Chat.Request, _signal?: AbortSignal): Promise<Chat.Output> {
        let response = await fetch(AOAI_ENDPOINT, {
            method: 'POST',
            headers: {
                Connection: 'close',
                'api-key': AOAI_KEY,
                'Content-Type': 'application/json',
                'Openai-Internal-Experimental-AllowToolUse': 'true',
            },
            body: JSON.stringify({
                ...input,
                stream: false,
                model: 'gpt-4o', // ignored
            }),
        });
        const responseJson = await response.json();
        return responseJson;
    },
};

const AOAI_ENDPOINT = process.env.AOAI_ENDPOINT!;
const AOAI_KEY = process.env.AOAI_KEY!;

export const getClient = (): Client => {
    return CLIENT_NEXT_MODEL8;
};