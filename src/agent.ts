import { getClient } from './client.js';
import { RuntimeContext } from './context.js';
import { doneTool, queryUser, submitDraft } from './tools/control.js';
import { readDirectory, readFile } from './tools/files.js';
import { getUserBlog, listUserBlogs } from './tools/github.js';
import { Chat } from '@agent/openai';

export class Agent {
    systemPrompt: string;

    constructor(
        readonly context: RuntimeContext
    ) {
        this.systemPrompt = context.renderTemplate('system.prompt');
    }

    async run(input: string): Promise<void> {
        const tools = [
            doneTool,
            queryUser,
            listUserBlogs,
            getUserBlog,
            readDirectory,
            readFile,
            submitDraft,
        ];

        const request: Chat.Request = {
            model: 'gpt-4o',
            messages: [{
                role: 'system',
                content: this.systemPrompt,
            }, {
                role: 'user',
                content: input,
            }],
            tool_choice: 'required',
            tools: tools.map(tool => ({
                type: 'function',
                function: {
                    name: tool.name,
                    parameters: tool.input,
                }
            })),
        };

        console.log('SYSTEM|');
        console.log(this.systemPrompt);
        console.log();
        console.log('USER|');
        console.log(input);
        console.log();

        let resp = await getClient().chat(request);

        while (resp.choices[0].message.tool_calls?.find(tool => tool.function.name !== 'done')) {
            request.messages.push({
                role: 'assistant',
                content: resp.choices[0].message.content,
                tool_calls: resp.choices[0].message.tool_calls,
            });

            const toolCalls = resp.choices[0].message.tool_calls ?? [{
                id: 'dynamic',
                type: 'function',
                function: {
                    name: 'queryUser',
                    arguments: JSON.stringify({
                        query: resp.choices[0].message.content,
                    }),
                }
            }];

            for (let toolCall of toolCalls) {
                if (toolCall.function.name !== 'dynamic') {
                    console.log("AGENT-TOOLCALL|");
                    console.log(`${toolCall.function.name}(${Object.entries(JSON.parse(toolCall.function.arguments)).map(([key, value]) => `${key}: "${value}"`).join(', ')})`);
                    console.log();
                }

                const result = await tools.find(tool => tool.name === toolCall?.function.name)?.execute(JSON.parse(toolCall?.function.arguments));
                const value = (result!.ok ? result?.value : "") ?? "";

                if (toolCall.id !== 'dynamic') {
                    console.log("TOOL|");
                    console.log(value);
                    console.log();

                    request.messages.push({
                        role: 'tool',
                        content: (result!.ok ? result?.value : "") ?? "",
                        tool_call_id: toolCall?.id,
                    });
                } else {
                    console.log("USER|");
                    console.log(value);
                    console.log();

                    request.messages.push({
                        role: 'user',
                        content: value,
                    });
                }
            }

            resp = await getClient().chat(request);
        }

        // Final 'done' tool
        console.log("AGENT-TOOLCALL|");
        console.log(`${resp.choices[0].message.tool_calls?.[0].function.name}(${Object.entries(JSON.parse(resp.choices[0].message.tool_calls?.[0].function.arguments!)).map(([key, value]) => `${key}: "${value}"`).join(', ')})`);
        console.log();
        console.log("------------------");
        console.log();
        console.log(JSON.parse(resp.choices[0].message.tool_calls?.[0].function.arguments!).post)
    }
}