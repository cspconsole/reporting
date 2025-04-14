export function isUnsafeInline(directiveValue: string): boolean {
    return directiveValue === 'unsafe-inline';
}

type RouteMatch = { pathRegex: string; value: string };

export function getCspConfigByRoute(routes: RouteMatch[], currentUrl: string): string | undefined {

    for (const { pathRegex, value } of routes) {
        if (new RegExp(pathRegex).test(currentUrl)) {
            return value;
        }
    }

    return undefined;
}

export function hasRouteCspConfig(routes: RouteMatch[], currentUrl: string): boolean {
    return !!getCspConfigByRoute(routes, currentUrl);
}
