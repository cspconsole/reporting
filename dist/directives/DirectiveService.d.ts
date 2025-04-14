export declare function isUnsafeInline(directiveValue: string): boolean;
type RouteMatch = {
    pathRegex: string;
    value: string;
};
export declare function getCspConfigByRoute(routes: RouteMatch[], currentUrl: string): string | undefined;
export declare function hasRouteCspConfig(routes: RouteMatch[], currentUrl: string): boolean;
export {};
