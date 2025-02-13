import { t, tool } from '@agent/tool';
import { REASON_PARAMETER_SCHEMA } from '../utils.js';
import { Ok } from '@agent/tool/result';
import fs from 'node:fs';
import path from 'node:path';

export const readDirectory = tool({
    name: 'readDirectory',
    description: 'Retrieves the files in a directory.',
    input: t.object({
        reason: REASON_PARAMETER_SCHEMA,
        recursive: t.boolean({
            description: 'Whether to read the directory recursively.',
            examples: [true, false],
        }),
        directory: t.string({
            description: 'The directory to read.',
            examples: ['.', 'src', 'src/tools'],
        })
    }),
    execute: async (input) => {
        try {
            const root = path.join("/workspaces/blogger-agent/", input.directory);
            const result = await fs.promises.readdir(root, { recursive: input.recursive });
            return Ok(result.map(file => path.join(root, file)).join('\n'));
        } catch {
            return Ok("DIRECTORY DOES NOT EXIST")
        }
    },
});

export const readFile = tool({
    name: 'readFile',
    description: 'Retrieves a file\' content',
    input: t.object({
        reason: REASON_PARAMETER_SCHEMA,
        path: t.string({
            description: 'The file\'s path.',
            examples: ['src/index.ts', 'src/tools/github.ts'],
        }),
    }),
    execute: async (input) => {
        try {
            const result = await fs.promises.readFile(input.path);
            return Ok(result.toString('utf-8'));
        } catch {
            return Ok("FILE NOT FOUND")
        }
    },
});
