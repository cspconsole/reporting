export declare function getPoliciesByDirective(cspHeader: string, directive: string): string | null;
export declare function getAllCspDirectivesByType({ cspHeader, type, selfReplacementUrl }: {
    cspHeader: string;
    type: string;
    selfReplacementUrl?: string;
}): string[];
