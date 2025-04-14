export type Config = {
    policies: {
        pathRegex: string;
        value: string;
    }[];
    reportUri: string;
    mode: 'enforce' | 'reportOnly';
    debug?: boolean;
};
export declare function initConfig(initialConfig: Config): void;
export declare function getPolicies(): Config['policies'];
export declare function getCspMode(): Config['mode'];
export declare function getReportUri(): Config['reportUri'];
export declare function shouldUseDebugMode(): Config['debug'];
