import { getClient } from './client.js';
import { RuntimeContext } from './context.js';
import { doneTool, queryUser } from './tools/control.js';
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
            tool_choice: 'auto',
            tools: tools.map(tool => ({
                type: 'function',
                function: {
                    name: tool.name,
                    parameters: tool.input,
                }
            })),
        };

        let resp = await getClient().chat(request);

        while (resp.choices[0].message.tool_calls?.[0].function.name !== 'done') {
            request.messages.push({
                role: 'assistant',
                content: resp.choices[0].message.content,
                tool_calls: resp.choices[0].message.tool_calls,
            });

            let toolCall = resp.choices[0].message.tool_calls?.[0];

            if (!toolCall) {
                toolCall = {
                    id: 'dynamic',
                    type: 'function',
                    function: {
                        name: 'queryUser',
                        arguments: JSON.stringify({
                            query: resp.choices[0].message.content,
                        }),
                    }
                }
            }

            const result = await tools.find(tool => tool.name === toolCall?.function.name)?.execute(JSON.parse(toolCall?.function.arguments));

            if (toolCall.id !== 'dynamic') {
                request.messages.push({
                    role: 'tool',
                    content: (result!.ok ? result?.value : "") ?? "",
                    tool_call_id: toolCall?.id,
                });
            } else {
                request.messages.push({
                    role: 'user',
                    content: (result!.ok ? result?.value : "") ?? "",
                });
            }

            resp = await getClient().chat(request);
        }
    }
}