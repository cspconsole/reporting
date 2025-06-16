export function hasElementSrc<T extends Element>(element: T): element is T & { src: string } {
    return !!element.getAttribute('src');
}

export function hasElementHref<T extends Element>(element: T): element is T & { href: string } {
    return !!element.getAttribute('href');
}

export function isElementWithNonceAndSrc(element :Element): boolean  {
    const nonce = element.getAttribute('nonce');

    if (!nonce) {
        return false;
    }

    return hasElementSrc(element);
}

export function isElementDataCspSrc<T extends Element>( element: T): element is T & { 'data-csp-src': string } {
    return element.getAttribute('data-csp-attr') === 'src';
}

export function isElementDataCspHref<T extends Element>( element: T): element is T & { 'data-csp-href': string } {
    return element.getAttribute('data-csp-attr') === 'href';
}

export function isElementDataCspResult<T extends Element>(element: T): element is T & { 'data-csp-elem': string } {
    return !!element.getAttribute('data-csp-result');
}

export function isElementScriptOrStyle(element: Element): element is HTMLScriptElement | HTMLStyleElement {
    return element.tagName.toLowerCase() === 'script' || element.tagName.toLowerCase() === 'style';
}

export function isNonceMatchingDirectiveValue({ element, directiveValue }: {element: Element; directiveValue: string}): boolean {
    return element.getAttribute('nonce') === directiveValue.replace('nonce-', '');
}

function isElementAttrMatchingDirectiveRegex({
    element,
    attrName,
    regex,
}: {
    element: Element;
    attrName: string;
    regex: string;
}): boolean {
    if (regex === '*') {
        return true;
    }

    try {
        const rawAttr = element.getAttribute(attrName);
        if (!rawAttr) {
            return false;
        }

        const resolvedUrl = new URL(rawAttr, document.baseURI).href;
        return new RegExp(regex).test(resolvedUrl);
    } catch {
        return false;
    }
}

export function isSrcElementMatchingDirectiveValueRegex({ element, regex }:{element: Element; regex: string}) : boolean {
    if (!hasElementSrc(element)) {
        return false;
    }

    return isElementAttrMatchingDirectiveRegex({ element, attrName: 'src', regex });
}

export function isCspDataSrcElementMatchingDirectiveValueRegex({ element, regex }:{element: Element; regex: string}) : boolean {
    if (!isElementDataCspSrc(element)) {
        return false;
    }

    let attribute = element.getAttribute('data-csp-src');

    if (!attribute) {
        return false;
    }

    return isElementAttrMatchingDirectiveRegex({ element, attrName: 'data-csp-src', regex });
}

export function isHrefElementMatchingDirectiveValueRegex({ element, regex }:{element: Element; regex: string}) : boolean {
    if (!hasElementHref(element)) {
        return false;
    }

    return isElementAttrMatchingDirectiveRegex({ element, attrName: 'href', regex });
}

export function isCspDataHrefElementMatchingDirectiveValueRegex({ element, regex }:{element: Element; regex: string}) : boolean {
    if (!isElementDataCspHref(element)) {
        return false;
    }

    let attribute = element.getAttribute('data-csp-src');

    if (!attribute) {
        return false;
    }

    return isElementAttrMatchingDirectiveRegex({ element, attrName: 'data-csp-href', regex });
}
