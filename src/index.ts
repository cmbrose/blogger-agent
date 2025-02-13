import { RuntimeContext } from './context.js';
import { getUserInput } from './utils.js';
import { Agent } from './agent.js';

async function main() {
    const context = new RuntimeContext();

    try {
        var query: string;
        const simpleQuery =
            `Write a blog about building an LLM based blog creation agent. You are this agent and are actually being used to write the blog.
            Relevant topics to cover include:
            - Getting access to a model
            - Scaffolding the agent application
            - Building tools to allow the agent to search for context on its own
            - Refining the agent's behavior and output quality`;
        query = await getUserInput(
            `What would you like me to do?\nExample: "${simpleQuery}" (press "return" to select)\n`
        );
        if (!query) {
            query = simpleQuery;
        }

        console.log('query: ', query);
        const agent = new Agent(context);
        await agent.run(query);
    } finally {
        console.log('Cleaning up environment...');
    }
}

main();