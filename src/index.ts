import { RuntimeContext } from './context.js';
import { getUserInput } from './utils.js';
import { Agent } from './agent.js';

async function main() {
    const context = new RuntimeContext();

    try {
        var query: string;
        query = await getUserInput(
            `What would you like me to do?\n`
        );
        console.log('query: ', query);
        const agent = new Agent(context);
        await agent.run(query);
    } finally {
        console.log('Cleaning up environment...');
    }
}

main();