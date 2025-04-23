import { getAllCspDirectivesByType } from "../directives/DirectiveParserService";
import {
    hasElementHref,
    hasElementSrc, isCspDataHrefElementMatchingDirectiveValueRegex,
    isCspDataSrcElementMatchingDirectiveValueRegex, isElementDataCspHref, isElementDataCspSrc, isElementScriptOrStyle,
    isElementWithNonceAndSrc, isHrefElementMatchingDirectiveValueRegex,
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

function blockSrcElement(element: Element & {src: string}): void {
    element.setAttribute('data-csp-src', element.src);
    element.setAttribute('data-csp-attr', 'src');
    element.removeAttribute('src');
    addDataCspResultAttribute(element);
}

function unlockSrcElement(element: Element): void {
    element.setAttribute('src', element.getAttribute('data-csp-src')!);
    removeDataCspResultAttribute(element);
}

function addDataCspResultAttribute(element: Element): void {
    element.setAttribute('data-csp-result', 'disabled');
}

function removeDataCspResultAttribute(element: Element): void {
    element.removeAttribute('data-csp-result');
}

function guardHtmlElement(element: Element, value: string): void {
    if (isElementWithNonceAndSrc({ element })) {
        if (isNonceMatchingDirectiveValue({ element, directiveValue: value })) {
            // allowed nonce
            return;
        } else {
            //disallowed nonce
            return;
        }
    }

    if (hasElementSrc(element)) {
        if (isSrcElementMatchingDirectiveValueRegex({ element, regex: value })) {
            // allowed
            return;
        } else {
            // disallowed
            return;
        }
    }

    if (isElementDataCspSrc(element)) {
        if (isCspDataSrcElementMatchingDirectiveValueRegex({ element, regex: value })){
            // allowed
            return;
        } else {
            // disallowed
            return;
        }
    }

    if (hasElementHref(element)) {
        if (isHrefElementMatchingDirectiveValueRegex({ element, regex: value })) {
            // allowed
            return;
        } else {
            // disallowed
            return;
        }
    }

    if (isElementDataCspHref(element)) {
        if (isCspDataHrefElementMatchingDirectiveValueRegex({ element, regex: value })) {
            // allowed
            return;
        } else {
            // disallowed
            return;
        }
    }

    if (isElementScriptOrStyle(element)) {
        if (isUnsafeInline(value)) {
            // if does not have data-csp-whatever attribute, comment the content
            return;
        } else {
            // if has data-csp-whatever attribute, then remove comment
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
