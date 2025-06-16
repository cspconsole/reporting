import { getAllCspDirectivesByType } from "../directives/DirectiveParserService";
import {
    hasElementHref,
    hasElementSrc,
    isCspDataHrefElementMatchingDirectiveValueRegex,
    isCspDataSrcElementMatchingDirectiveValueRegex,
    isElementDataCspResult,
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
    if (isElementDataCspResult(element)) {
        return;
    }

    element.setAttribute('data-csp-result', 'disabled');
    element.innerHTML = '/*' + element.innerHTML + '*/';
}

function unlockUnsafeInline(element: Element): void {
    if (!isElementDataCspResult(element)) {
        return;
    }

    element.removeAttribute('data-csp-result');
    element.innerHTML = element.innerHTML.trim().replace(/^\/\*/, '').replace(/\*\/$/, '');
}

function guardHtmlElement(element: Element, values: string[]): void {
    if (isElementWithNonceAndSrc(element)) {
        let isMatchingNonce = false;
        values.forEach((value) => {
            if (isNonceMatchingDirectiveValue({ element, directiveValue: value })) {
                isMatchingNonce = true;
            }
        });

        if (isMatchingNonce) {
            if (isElementDataCspResult(element)) {
                unlockSrcElement(element);
                return;
            }
        } else {
            blockSrcElement(element);
            return;
        }
    }

    if (hasElementSrc(element)) {
        let isMatchingSrc = false;
        values.forEach((value) => {
            if (isSrcElementMatchingDirectiveValueRegex({ element, regex: value })) {
                isMatchingSrc = true;
            }
        });

        if (isMatchingSrc) {
            if (isElementDataCspResult(element)) {
                unlockSrcElement(element);
                return;
            }
        } else {
            blockSrcElement(element);
            return;
        }
    }

    if (isElementDataCspSrc(element)) {
        let isMatchingDataSrc = false;

        values.forEach((value) => {
            if (isCspDataSrcElementMatchingDirectiveValueRegex({ element, regex: value })) {
                isMatchingDataSrc = true;
            }
        });

        if (isMatchingDataSrc){
            if (isElementDataCspResult(element)) {
                unlockSrcElement(element);
                return;
            }
        } else {
            blockSrcElement(element);
            return;
        }
    }

    if (hasElementHref(element)) {
        let isMatchingHref = false;
        values.forEach((value) => {
            if (isHrefElementMatchingDirectiveValueRegex({ element, regex: value })) {
                isMatchingHref = true;
            }
        });
        if (isMatchingHref) {
            if (isElementDataCspResult(element)) {
                unlockHrefElement(element);
                return;
            }
        } else {
            blockHrefElement(element);
            return;
        }
    }

    if (isElementDataCspHref(element)) {
        let isMatchingDataHref = false;
        values.forEach((value) => {
            if (isCspDataHrefElementMatchingDirectiveValueRegex({ element, regex: value })) {
                isMatchingDataHref = true;
            }
        });
        if (isMatchingDataHref) {
            if (isElementDataCspResult(element)) {
             unlockHrefElement(element);
             return;
            }
        } else {
            blockHrefElement(element);
            return;
        }
    }

    if (isElementScriptOrStyle(element)) {
        if (hasElementSrc(element) || hasElementHref(element)) {
            return;
        }

        const isUnsafeInlineAllowed = values.some((value) => isUnsafeInline(value));

        if (isUnsafeInlineAllowed) {
            unlockUnsafeInline(element);
            return;
        }

        blockUnsafeInline(element);
    }
}

export function htmlGuard({ html = document, allowedDirectives, selfReplacementUrl }: {
    html: Document;
    allowedDirectives: string | undefined;
    selfReplacementUrl?: string
}): void {
    if (!allowedDirectives) {
        return;
    }

    Object.entries(HTML_ELEMENTS).forEach(([htmlTagName, directive]) => {
        const htmlElements = html.querySelectorAll(htmlTagName);
        const values = getAllCspDirectivesByType({ cspHeader: allowedDirectives, type: directive, selfReplacementUrl });

        for (const element of htmlElements) {
            guardHtmlElement(element, values);
       }
    });
}
