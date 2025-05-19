import { getPoliciesByDirective, getAllCspDirectivesByType } from "../DirectiveParserService";

const CSP_HEADER = "default-src 'self'; child-src 'self'; connect-src 'self' https://analytics.google.com https://embed.tawk.to https://pagead2.googlesyndication.com https://region1.analytics.google.com https://region1.google-analytics.com https://stats.g.doubleclick.net https://va.tawk.to https://www.google-analytics.com https://www.google.com wss://*.tawk.to; font-src 'self' https://fonts.gstatic.com; form-action 'self'; frame-ancestors 'self'; frame-src 'self' https://www.googletagmanager.com; img-src 'self' https://embed.tawk.to https://www.google.com.my https://www.google.es https://www.googletagmanager.com; manifest-src 'self'; media-src 'self' https://embed.tawk.to; object-src 'self'; script-src 'self' 'unsafe-inline' https://apis.google.com https://cdn.cspconsole.com https://embed.tawk.to https://www.googletagmanager.com sha256-E74O/TPXvI8S3ToIohXJwCCdiY4PdK1vGDQGC2fqKdg= sha256-fX6h3BgGJihlhPAs/rDqBSxoZTm36qZbp9zNIjLUFY4=; script-src-elem https://*.cloudflare.net https://microsoftazure.com; style-src 'self' 'unsafe-inline' https://cdn.cspconsole.com https://embed.tawk.to https://fonts.googleapis.com sha256-3ES2uNrd8/6GhHviIz+Vkvh3px44frbETjEZqYc3HAg= sha256-MnPweODNNWJyc/GRQA/Kn9GSJx1s3yxbQyBVrSEsXp8= sha256-h17i/NAekPiaIOlQqAjejMYjK42ywM6sW/pCKFwFTSM=; worker-src 'self';";

describe('DirectiveParserService', () => {
    describe('getPoliciesByDirective', () => {
        it('returns values for extracted CSP directive', () => {
            const result = getPoliciesByDirective(CSP_HEADER, 'script-src-elem');

            expect(result).toBe('script-src-elem https://*.cloudflare.net https://microsoftazure.com;');
        });
    });

    describe('getAllDirectivesByType', () => {
        it('returns no directives when type is not set in CSP header value', () => {
            const result = getAllCspDirectivesByType({ cspHeader: CSP_HEADER, type: 'style-src-elem' });

            expect(result).toStrictEqual([]);
        });

        it('returns directives when type is set in CSP header value', () => {
            const result = getAllCspDirectivesByType({ cspHeader: CSP_HEADER, type: 'script-src', selfReplacementUrl: 'https://cspconsole.com' });

            expect(result).toStrictEqual([
                'https://cspconsole.com',
                'unsafe-inline',
                'https://apis.google.com',
                'https://cdn.cspconsole.com',
                'https://embed.tawk.to',
                'https://www.googletagmanager.com',
                'sha256-E74O/TPXvI8S3ToIohXJwCCdiY4PdK1vGDQGC2fqKdg=',
                'sha256-fX6h3BgGJihlhPAs/rDqBSxoZTm36qZbp9zNIjLUFY4='
            ]);
        });
    });
});
