import { getAllCspDirectivesByType } from "../directives/DirectiveParserService";
import {
    hasElementHref,
    hasElementSrc,
    isCspDataHrefElementMatchingDirectiveValueRegex,
    isCspDataSrcElementMatchingDirectiveValueRegex,
    isElementDataCspElem,
    isElementDataCspHref,
    isElementDataCspSrc,
    isElementScriptOrStyle,
    isElementWithNonceAndSrc,
    isHrefElementMatchingDirectiveValueRegex,
    isNonceMatchingDirectiveValue,
    isSrcElementMatchingDirectiveValueRegex
} from "../directives/HtmlElementService";
import { isUnsafeInline } from "../directives/DirectiveService";

const HTML_ELEMENTS = {
    'script': 'script-src',
    'style': 'style-src',
    'link[rel="stylesheet"]': 'style-src',
    'img': 'img-src',
    'iframe': 'frame-src',
};

function blockSrcElement(element: Element): void {
    if (!hasElementSrc(element)) {
        return;
    }

    if (isElementDataCspSrc(element)) {
        return;
    }

    element.setAttribute('data-csp-src', element.src);
    element.setAttribute('data-csp-attr', 'src');
    element.removeAttribute('src');
    addDataCspResultAttribute(element);
}

function unlockSrcElement(element: Element): void {
    if (!isElementDataCspSrc(element)) {
        return;
    }

    element.setAttribute('src', element.getAttribute('data-csp-src')!);
    removeDataCspAttributes(element);
}

function blockHrefElement(element: Element): void {
    if (!hasElementHref(element)) {
        return;
    }

    if (isElementDataCspHref(element)) {
        return;
    }

    element.setAttribute('data-csp-src', element.href);
    element.setAttribute('data-csp-attr', 'href');
    element.removeAttribute('href');
    addDataCspResultAttribute(element);
}

function unlockHrefElement(element: Element): void {
    if (!isElementDataCspHref(element)) {
        return;
    }

    element.setAttribute('href', element.getAttribute('data-csp-src')!);
    removeDataCspAttributes(element);
}

function addDataCspResultAttribute(element: Element): void {
    element.setAttribute('data-csp-result', 'disabled');
}

function removeDataCspAttributes(element: Element): void {
    element.removeAttribute('data-csp-src');
    element.removeAttribute('data-csp-attr');
    element.removeAttribute('data-csp-result');
}

function blockUnsafeInline(element: Element): void {
    if (isElementDataCspElem(element)) {
        return;
    }

    element.setAttribute('data-csp-elem', 'disabled');
    element.innerHTML = '/*' + element.innerHTML + '*/';
}

function unlockUnsafeInline(element: Element): void {
    if (!isElementDataCspElem(element)) {
        return;
    }

    element.removeAttribute('data-csp-elem');
    element.innerHTML = element.innerHTML.trim().replace(/^\/\*/, '').replace(/\*\/$/, '');
}

function guardHtmlElement(element: Element, value: string): void {
    if (isElementWithNonceAndSrc(element)) {
        if (isNonceMatchingDirectiveValue({ element, directiveValue: value })) {
            unlockSrcElement(element);
            return;
        } else {
            blockSrcElement(element);
            return;
        }
    }

    if (hasElementSrc(element)) {
        if (isSrcElementMatchingDirectiveValueRegex({ element, regex: value })) {
            unlockSrcElement(element);
            return;
        } else {
            blockSrcElement(element);
            return;
        }
    }

    if (isElementDataCspSrc(element)) {
        if (isCspDataSrcElementMatchingDirectiveValueRegex({ element, regex: value })){
            unlockSrcElement(element);
            return;
        } else {
            blockSrcElement(element);
            return;
        }
    }

    if (hasElementHref(element)) {
        if (isHrefElementMatchingDirectiveValueRegex({ element, regex: value })) {
            unlockHrefElement(element);
            return;
        } else {
            blockHrefElement(element);
            return;
        }
    }

    if (isElementDataCspHref(element)) {
        if (isCspDataHrefElementMatchingDirectiveValueRegex({ element, regex: value })) {
            unlockHrefElement(element);
            return;
        } else {
            blockHrefElement(element);
            return;
        }
    }

    if (isElementScriptOrStyle(element)) {
        if (isUnsafeInline(value)) {
            blockUnsafeInline(element);
            return;
        } else {
            unlockUnsafeInline(element);
            return;
        }
    }
}

export function htmlGuard({ html = document, allowedDirectives }: {html: Document, allowedDirectives: string | undefined;}): void {
    if (!allowedDirectives) {
        return;
    }

    Object.entries(HTML_ELEMENTS).forEach(([htmlTagName, directive]) => {
        const htmlElements = html.querySelectorAll(htmlTagName);
        const values = getAllCspDirectivesByType({ cspHeader: allowedDirectives, type: directive });

        for (const element of htmlElements) {
            for (const value of values) {
                guardHtmlElement(element, value);
            }
        }
    });
}
