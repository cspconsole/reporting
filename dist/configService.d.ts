import { Config } from './types';
export declare function sayHi(name: string): string;
export declare function loadConfig(jsonConfig: string | Config): Promise<void>;
export declare function getConfig(): Config;
