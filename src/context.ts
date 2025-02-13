import path from 'node:path';
import nunjucks from 'nunjucks';
import { fileURLToPath } from 'url';

export class RuntimeContext {
    constructor() {
        const scriptFilePath = fileURLToPath(import.meta.url);
        const scriptFileDirectory = path.dirname(scriptFilePath);
        const rootDirectory = path.dirname(scriptFileDirectory);
        nunjucks.configure(path.join(rootDirectory, 'templates'), {
            autoescape: true,
        });
    }

    renderTemplate(name: string, context?: object): string {
        return nunjucks.render(name, context);
    }
}