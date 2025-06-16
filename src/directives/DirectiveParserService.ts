function extractCSPDirective(cspHeader: string, directive: string): string | null {
    const directives = cspHeader.split(';').map(d => d.trim());

    for (const entry of directives) {
        const entryDirective = entry.split(' ')[0];
        if (entryDirective === directive) {
            return entry.slice(directive.length).trim();
        }
    }

    return null;
}

export function getPoliciesByDirective(cspHeader: string, directive: string): string | null {
    const extractedCSPDirective = extractCSPDirective(cspHeader, directive);

    if (!extractedCSPDirective) {
        return null;
    }

    return `${directive} ${extractedCSPDirective};`;
}

export function getAllCspDirectivesByType({ cspHeader, type, selfReplacementUrl }: {cspHeader: string; type: string; selfReplacementUrl?: string;}): string[] {
    const selfReplacements = [
        selfReplacementUrl ?? location.origin
    ];

    if (cspHeader.indexOf(type) < 0) {
        return [];
    }

    const cspDirective = extractCSPDirective(cspHeader, type);

    if (!cspDirective) {
        return [];
    }

    const cspDirectives = cspDirective.split(' ').filter(val => val.length > 0).map(val => val.replace(/'/g, ""));

    return cspDirectives.flatMap(value => value === 'self' ? selfReplacements : value);
}
