import { Config } from './types';

let currentConfig: Config | null = null;

export function sayHi(name: string): string {
    return `Hi ${name}`;
}

export async function loadConfig(jsonConfig: string | Config): Promise<void> {
    if (typeof jsonConfig === 'string') {
        const response = await fetch(jsonConfig);
        currentConfig = await response.json();
    } else {
        currentConfig = jsonConfig;
    }
}

export function getConfig(): Config {
    if (!currentConfig) {
        throw new Error('Config not loaded. Call `loadConfig` first.');
    }
    return currentConfig;
}
