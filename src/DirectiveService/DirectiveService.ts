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
export function getAllCspDirectivesByType({ cspHeader, type }: {cspHeader: string; type: string}): string[] {
    if (cspHeader.indexOf(type) < 0) {
        return [];
    }

    const cspDirective = extractCSPDirective(cspHeader, type);

    if (!cspDirective) {
        return [];
    }

    return cspDirective.split(' ').filter(val => val.length > 0).map(val => val.replace(/'/g, ""));;
}
