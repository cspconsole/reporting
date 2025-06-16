export declare function reportViolation({ directive, blockedUri, documentUrl, originalPolicy, referrer, statusCode }: {
    directive: string;
    blockedUri: string;
    documentUrl: string;
    originalPolicy: string;
    referrer?: string;
    statusCode?: number;
}): void;
