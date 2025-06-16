import {
    hasElementHref,
    hasElementSrc, isCspDataHrefElementMatchingDirectiveValueRegex,
    isCspDataSrcElementMatchingDirectiveValueRegex,
    isElementDataCspResult,
    isElementDataCspHref,
    isElementDataCspSrc,
    isElementScriptOrStyle,
    isElementWithNonceAndSrc,
    isHrefElementMatchingDirectiveValueRegex,
    isNonceMatchingDirectiveValue,
    isSrcElementMatchingDirectiveValueRegex
} from "../HtmlElementService";

describe('HtmlElementService', () => {
    describe('hasElementSrc', () => {
        it('returns true when element has src attribute', () => {
            const element = document.createElement('img');
            element.setAttribute('src', "https://cspconsole.com/hello.png");

            const result = hasElementSrc(element);

            expect(result).toBe(true);
        });

        it('returns false when element has src attribute', () => {
            const element = document.createElement('link');
            element.setAttribute('href', "https://cspconsole.com/style.css");

            const result = hasElementSrc(element);

            expect(result).toBe(false);
        });
    });

    describe('hasElementHref', () => {
        it('returns false when element has src attribute', () => {
            const element = document.createElement('img');
            element.setAttribute('src', "https://cspconsole.com/hello.png");

            const result = hasElementHref(element);

            expect(result).toBe(false);
        });

        it('returns true when element has src attribute', () => {
            const element = document.createElement('link');
            element.setAttribute('href', "https://cspconsole.com/style.css");

            const result = hasElementHref(element);

            expect(result).toBe(true);
        });
    });

    describe('isElementWithNonceAndSrc', () => {
        it('returns false when element does not have a nonce', () => {
            const element = document.createElement('img');
            element.setAttribute('src', "https://cspconsole.com/hello.png");

            const result = isElementWithNonceAndSrc(element);

            expect(result).toBe(false);
        });

        it('returns false when element has a nonce but is does not have src', () => {
            const element = document.createElement('link');
            element.setAttribute('nonce', 'XYZ');
            element.setAttribute('href', "https://cspconsole.com/style.css");

            const result = isElementWithNonceAndSrc(element);

            expect(result).toBe(false);
        });

        it('returns true when element has a nonce and src', () => {
            const element = document.createElement('img');
            element.setAttribute('nonce', 'XYZ');
            element.setAttribute('src', "https://cspconsole.com/hello.png");

            const result = isElementWithNonceAndSrc(element);

            expect(result).toBe(true);
        });
    });

    describe('isElementDataCspSrc', () => {
        it('returns false when element data-csp-attr is not src', () => {
            const element = document.createElement('link');
            element.setAttribute('data-csp-attr', 'href');
            element.setAttribute('data-csp-src', 'https://cspconsole.com/style.css');

            const result = isElementDataCspSrc(element);

            expect(result).toBe(false);
        });

        it('returns true when element data-csp-attr is src', () => {
            const element = document.createElement('img');
            element.setAttribute('data-csp-attr', 'src');
            element.setAttribute('data-csp-src', 'https://cspconsole.com/hello.png');

            const result = isElementDataCspSrc(element);

            expect(result).toBe(true);
        });
    });

    describe('isElementDataCspHref', () => {
        it('returns true when element data-csp-attr is href', () => {
            const element = document.createElement('link');
            element.setAttribute('data-csp-attr', 'href');
            element.setAttribute('data-csp-src', 'https://cspconsole.com/style.css');

            const result = isElementDataCspHref(element);

            expect(result).toBe(true);
        });

        it('returns false when element data-csp-attr is not href', () => {
            const element = document.createElement('img');
            element.setAttribute('data-csp-attr', 'src');
            element.setAttribute('data-csp-src', 'https://cspconsole.com/hello.png');

            const result = isElementDataCspHref(element);

            expect(result).toBe(false);
        });
    });

    describe('isElementDataCspElem', () => {
        it('returns false when element does not have data-csp-elem', () => {
            const element = document.createElement('img');
            element.setAttribute('data-csp-attr', 'src');
            element.setAttribute('data-csp-src', 'https://cspconsole.com/hello.png');

            const result = isElementDataCspResult(element);

            expect(result).toBe(false);
        });

        it('returns true when element has data-csp-elem', () => {
            const element = document.createElement('img');
            element.setAttribute('data-csp-elem', 'disabled');
            element.setAttribute('data-csp-attr', 'src');
            element.setAttribute('data-csp-src', 'https://cspconsole.com/hello.png');

            const result = isElementDataCspResult(element);

            expect(result).toBe(true);
        });
    });

    describe('isElementScriptOrStyle', () => {
        it('returns false when element is not script or style', () => {
            const element = document.createElement('img');
            element.setAttribute('data-csp-attr', 'src');
            element.setAttribute('data-csp-src', 'https://cspconsole.com/hello.png');

            const result = isElementScriptOrStyle(element);

            expect(result).toBe(false);
        });

        it('returns true when element is script or style', () => {
            const element1 = document.createElement('script');

            const element2 = document.createElement('style');

            [element1, element2].forEach((element) => {
                const result = isElementScriptOrStyle(element);
                expect(result).toBe(true);
            });
        });
    });

    describe('isNonceMatchingDirectiveValue', () => {
        it('returns true when nonce matches directive value', () => {
            const element = document.createElement('script');
            element.setAttribute('nonce', 'XYZ');
            const result = isNonceMatchingDirectiveValue({ element, directiveValue: 'XYZ' });

            expect(result).toBe(true);
        });

        it('returns false when nonce does not match directive value', () => {
            const element = document.createElement('script');
            element.setAttribute('nonce', 'ZYX');
            const result = isNonceMatchingDirectiveValue({ element, directiveValue: 'XYZ' });

            expect(result).toBe(false);
        });
    });

    describe('isSrcElementMatchingDirectiveValueRegex', () => {
        it('returns false when element does not have src', () => {
            const element = document.createElement('script');
            element.setAttribute('nonce', 'XYZ');
            const result = isSrcElementMatchingDirectiveValueRegex({ element, regex: 'https://[^.]+.cspconsole.com' });

            expect(result).toBe(false);
        });

        it('returns false when element src does not match regex', () => {
            const element = document.createElement('img');
            element.setAttribute('src', 'https://placehold.co/600x400.png');
            const result = isSrcElementMatchingDirectiveValueRegex({ element, regex: 'https://[^.]+.cspconsole.com' });

            expect(result).toBe(false);
        });

        it('returns true when element src does match regex', () => {
            const element = document.createElement('img');
            element.setAttribute('src', 'https://app.cspconsole.com/logo.png');
            const result = isSrcElementMatchingDirectiveValueRegex({ element, regex: 'https://[^.]+.cspconsole.com' });

            expect(result).toBe(true);
        });
    });

    describe('isCspDataSrcElementMatchingDirectiveValueRegex', () => {
        it('returns false when element does not have data-csp-attr src', () => {
            const element = document.createElement('img');
            element.setAttribute('src', 'https://app.cspconsole.com/logo.png');
            const result = isCspDataSrcElementMatchingDirectiveValueRegex({ element, regex: 'https://[^.]+.cspconsole.com' });

            expect(result).toBe(false);
        });

        it('returns false when element has data-csp-src is empty', () => {
            const element = document.createElement('img');
            element.setAttribute('data-csp-attr', 'src');
            element.setAttribute('data-csp-src', '');
            const result = isCspDataSrcElementMatchingDirectiveValueRegex({ element, regex: 'https://[^.]+.cspconsole.com' });

            expect(result).toBe(false);
        });

        it('returns false when element has data-csp-attr src but value does not match regex', () => {
            const element = document.createElement('img');
            element.setAttribute('data-csp-attr', 'src');
            element.setAttribute('data-csp-src', 'https://placehold.co/600x400.png');
            const result = isCspDataSrcElementMatchingDirectiveValueRegex({ element, regex: 'https://[^.]+.cspconsole.com' });

            expect(result).toBe(false);
        });

        it('returns true when element has data-csp-attr src and value matches regex', () => {
            const element = document.createElement('img');
            element.setAttribute('data-csp-attr', 'src');
            element.setAttribute('data-csp-src', 'https://app.cspconsole.com/logo.png');
            const result = isCspDataSrcElementMatchingDirectiveValueRegex({ element, regex: 'https://[^.]+.cspconsole.com' });

            expect(result).toBe(true);
        });
    });

    describe('isHrefElementMatchingDirectiveValueRegex', () => {
        it('returns false when element does not have href', () => {
            const element = document.createElement('link');
            element.setAttribute('nonce', 'XYZ');
            const result = isHrefElementMatchingDirectiveValueRegex({ element, regex: 'https://[^.]+.cspconsole.com' });

            expect(result).toBe(false);
        });

        it('returns false when element href does not match regex', () => {
            const element = document.createElement('link');
            element.setAttribute('href', 'https://cdn.jsdelivr.net/npm/@fancyapps/ui/dist/fancybox/fancybox.css');
            const result = isHrefElementMatchingDirectiveValueRegex({ element, regex: 'https://[^.]+.cspconsole.com' });

            expect(result).toBe(false);
        });

        it('returns true when element href does match regex', () => {
            const element = document.createElement('link');
            element.setAttribute('href', 'https://app.cspconsole.com/style.css');
            const result = isHrefElementMatchingDirectiveValueRegex({ element, regex: 'https://[^.]+.cspconsole.com' });

            expect(result).toBe(true);
        });
    });

    describe('isCspDataHrefElementMatchingDirectiveValueRegex', () => {
        it('returns false when element does not have data-csp-attr href', () => {
            const element = document.createElement('link');
            element.setAttribute('href', 'https://cdn.jsdelivr.net/npm/@fancyapps/ui/dist/fancybox/fancybox.css');
            const result = isCspDataHrefElementMatchingDirectiveValueRegex({ element, regex: 'https://[^.]+.cspconsole.com' });

            expect(result).toBe(false);
        });

        it('returns false when element has data-csp-attr href is empty', () => {
            const element = document.createElement('img');
            element.setAttribute('data-csp-attr', 'href');
            element.setAttribute('data-csp-src', '');
            const result = isCspDataHrefElementMatchingDirectiveValueRegex({ element, regex: 'https://[^.]+.cspconsole.com' });

            expect(result).toBe(false);
        });

        it('returns false when element has data-csp-attr href but value does not match regex', () => {
            const element = document.createElement('img');
            element.setAttribute('data-csp-attr', 'href');
            element.setAttribute('data-csp-src', 'https://cdn.jsdelivr.net/npm/@fancyapps/ui/dist/fancybox/fancybox.css');
            const result = isCspDataHrefElementMatchingDirectiveValueRegex({ element, regex: 'https://[^.]+.cspconsole.com' });

            expect(result).toBe(false);
        });

        it('returns true when element has data-csp-attr href and value matches regex', () => {
            const element = document.createElement('img');
            element.setAttribute('data-csp-attr', 'href');
            element.setAttribute('data-csp-src', 'https://app.cspconsole.com/style.css');
            const result = isCspDataHrefElementMatchingDirectiveValueRegex({ element, regex: 'https://[^.]+.cspconsole.com' });

            expect(result).toBe(true);
        });
    });
});
