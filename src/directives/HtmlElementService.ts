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

export function isElementDataCspElem<T extends Element>( element: T): element is T & { 'data-csp-elem': string } {
    return !!element.getAttribute('data-csp-elem');
}

export function isElementScriptOrStyle(element: Element): element is HTMLScriptElement | HTMLStyleElement {
    return element.tagName.toLowerCase() === 'script' || element.tagName.toLowerCase() === 'style';
}

export function isNonceMatchingDirectiveValue({ element, directiveValue }: {element: Element; directiveValue: string}): boolean {
    return element.getAttribute('nonce') === directiveValue;
}

export function isSrcElementMatchingDirectiveValueRegex({ element, regex }:{element: Element; regex: string}) : boolean {
    if (!hasElementSrc(element)) {
        return false;
    }

    return new RegExp(regex).test(element.src);
}

export function isHrefElementMatchingDirectiveValueRegex({ element, regex }:{element: Element; regex: string}) : boolean {
    if (!hasElementHref(element)) {
        return false;
    }

    return new RegExp(regex).test(element.href);
}

export function isCspDataSrcElementMatchingDirectiveValueRegex({ element, regex }:{element: Element; regex: string}) : boolean {
    if (!isElementDataCspSrc(element)) {
        return false;
    }

    let attribute = element.getAttribute('data-csp-src');

    if (!attribute) {
        return false;
    }

    return new RegExp(regex).test(attribute);
}

export function isCspDataHrefElementMatchingDirectiveValueRegex({ element, regex }:{element: Element; regex: string}) : boolean {
    if (!isElementDataCspHref(element)) {
        return false;
    }

    let attribute = element.getAttribute('data-csp-src');

    if (!attribute) {
        return false;
    }

    return new RegExp(regex).test(attribute);
}
