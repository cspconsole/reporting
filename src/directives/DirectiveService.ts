export function isUnsafeInline(directiveValue: string): boolean {
    return directiveValue === 'unsafe-inline';
}

type RouteMatch = { pathRegex: string; values: string };

export function getCspConfigByRoute(routes: RouteMatch[], currentUrl: string): string | undefined {

    for (const { pathRegex, values } of routes) {
        if (new RegExp(pathRegex).test(currentUrl)) {
            return values;
        }
    }

    return undefined;
}

export function hasRouteCspConfig(routes: RouteMatch[], currentUrl: string): boolean {
    return !!getCspConfigByRoute(routes, currentUrl);
}
