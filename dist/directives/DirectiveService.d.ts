export type CspDirective = 'default-src' | 'script-src' | 'script-src-elem' | 'script-src-attr' | 'style-src' | 'style-src-elem' | 'style-src-attr' | 'img-src' | 'font-src' | 'media-src' | 'connect-src' | 'frame-src' | 'child-src' | 'object-src';
export declare function isUnsafeInline(directiveValue: string): boolean;
type RouteMatch = {
    pathRegex: string;
    value: string;
};
export declare function getCspConfigByRoute(routes: RouteMatch[], currentUrl: string): string | undefined;
export declare function hasRouteCspConfig(routes: RouteMatch[], currentUrl: string): boolean;
export {};
