import readline from 'readline';
import { t } from '@agent/tool';

export function getUserInput(message: string): Promise<string> {
    return new Promise((resolve) => {
        const rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout,
        });

        rl.question("AGENT|\n" + message, (answer) => {
            rl.close();
            resolve(answer);
        });
    });
}

export const REASON_PARAMETER_SCHEMA = t.optional(t.string({
    description: 'The reason behind choosing this tool',
}));
