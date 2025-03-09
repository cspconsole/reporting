import { isUrlAllowedByDirectiveValue, normalizeCspDirectiveValue } from "../DirectiveRegexService";

describe('DirectiveRegexService', () => {
    describe('normalizeCspDirectiveValue', () => {
        it('returns normalized CSP directive value when wildcard is present', () => {
            const result = normalizeCspDirectiveValue('https://*.cspconsole.com');

            expect(result).toBe('https://[^.]+.cspconsole.com');
        });

        it('returns normalized CSP directive value when wildcard is not present', () => {
            const result = normalizeCspDirectiveValue('https://cspconsole.com');

            expect(result).toBe('https://cspconsole.com');
        });
    });

    describe('isUrlAllowedByDirectiveValue', () => {
        it('returns false when url is not matching the directive value', () => {
            const result = isUrlAllowedByDirectiveValue('https://[^.]+.cspconsole.com', 'https://example.com');

            expect(result).toBe(false);
        });

        it('returns true when url is matching the wildcard directive value', () => {
            const result = isUrlAllowedByDirectiveValue('https://[^.]+.cspconsole.com', 'https://docs.cspconsole.com');

            expect(result).toBe(true);
        });

        it('returns true when url is exact match of directive value', () => {
            const result = isUrlAllowedByDirectiveValue('https://images.cspconsole.com/niceImage.jpg', 'https://images.cspconsole.com/niceImage.jpg');

            expect(result).toBe(true);
        });
    });
});
