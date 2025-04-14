export declare function isElementWithNonceAndSrc({ element }: {
    element: Element;
}): boolean;
export declare function isElementDataCspSrc<T extends Element>(element: T): element is T & {
    'data-csp-src': string;
};
export declare function isElementDataCspHref<T extends Element>(element: T): element is T & {
    'data-csp-href': string;
};
export declare function isElementScriptOrStyle(element: Element): element is HTMLScriptElement | HTMLStyleElement;
export declare function isNonceMatchingDirectiveValue({ element, directiveValue }: {
    element: Element;
    directiveValue: string;
}): boolean;
export declare function isSrcElementMatchingDirectiveValueRegex({ element, regex }: {
    element: Element;
    regex: string;
}): boolean;
export declare function isCspDataSrcElementMatchingDirectiveValueRegex({ element, regex }: {
    element: Element;
    regex: string;
}): boolean;
export declare function isCspDataHrefElementMatchingDirectiveValueRegex({ element, regex }: {
    element: Element;
    regex: string;
}): boolean;
