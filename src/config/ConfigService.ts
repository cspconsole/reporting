export type Config = {
    policies: { pathRegex: string; value: string }[];
    reportUri: string;
    mode: 'enforce' | 'reportOnly';
    debug?: boolean;
};

let appConfig: Config | null = null;
const MISSING_CONFIG_ERROR = "Config has not been initialized.";

export function initConfig(initialConfig: Config): void {
    if (appConfig) {
        throw new Error("Config has already been initialized.");
    }
    appConfig = Object.freeze({ ...initialConfig });
}

export function getPolicies(): Config['policies'] {
    if (!appConfig) {
        throw new Error(MISSING_CONFIG_ERROR);
    }

    return appConfig.policies;
}

export function getCspMode(): Config['mode'] {
    if (!appConfig) {
        throw new Error(MISSING_CONFIG_ERROR);
    }

    return appConfig.mode;
}

export function getReportUri(): Config['reportUri'] {
    if (!appConfig) {
        throw new Error(MISSING_CONFIG_ERROR);
    }

    return appConfig.reportUri;
}

export function shouldUseDebugMode(): Config['debug']{
    if (!appConfig) {
        throw new Error(MISSING_CONFIG_ERROR);
    }

    return appConfig.debug;
}
