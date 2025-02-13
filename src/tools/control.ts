import { t, tool } from '@agent/tool';
import { getUserInput, REASON_PARAMETER_SCHEMA } from '../utils.js';
import { Ok } from '@agent/tool/result';

export const doneTool = tool({
    name: 'done',
    description: 'Signals that the blog is finished.',
    input: t.object({
        reason: REASON_PARAMETER_SCHEMA,
        post: t.string({
            description: 'The final blog post.',
            examples: ['# My Blog Post\n\nThis is the content of my blog post.'],
        }),
    }),
    execute(_input) {
        return Ok();
    },
});

export const queryUser = tool({
    name: 'queryUser',
    description: 'Asks the user a question and returns their answer.',
    input: t.object({
        reason: REASON_PARAMETER_SCHEMA,
        query: t.string({
            description: 'The question to ask the user. Inputs should only be questions, not statements, requests, or commands.',
            examples: ['What should I do next?', 'What are some examples?'],
        }),
    }),
    async execute(input) {
        const userInput = await getUserInput(input.query);
        return Ok(userInput);
    },
});