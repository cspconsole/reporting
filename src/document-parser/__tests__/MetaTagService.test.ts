import { getCspValueFromMetaTag, updateCspMetaTagInDocument } from "../MetaTagService";
import { JSDOM } from "jsdom";

describe('MetaTagService',  function () {
    describe('getCspValueFromMetaTag', function () {
        it('returns undefined when meta tag is not defined in HTML', () => {
            const html = new JSDOM(`
                <html lang="en">
                    <head>
                        <title>dummy page</title>
                    </head>
                    <body>
                        <p>dummy content</p>
                    </body>
                </html>`);
            
            const result = getCspValueFromMetaTag(html.window.document);
            
            expect(result).toBe(undefined);
        });

        it('returns empty csp directives from meta tag without misses content', () => {
            const html = new JSDOM(`
                <html lang="en">
                    <head>
                        <meta http-equiv="Content-Security-Policy">
                        <title>dummy page</title>
                    </head>
                    <body>
                        <p>dummy content</p>
                    </body>
                </html>`);

            const result = getCspValueFromMetaTag(html.window.document);

            expect(result).toBe("");
        });

        it('returns csp directives defined in HTML meta tag', () => {
            const html = new JSDOM(`
                <html lang="en">
                    <head>
                        <meta http-equiv="Content-Security-Policy" content="default-src 'self'; script-src 'self';"> 
                        <title>dummy page</title>
                    </head>
                    <body>
                        <p>dummy content</p>
                    </body>
                </html>`);

            const result = getCspValueFromMetaTag(html.window.document);

            expect(result).toBe("default-src 'self'; script-src 'self';");
        });
    });

    describe('updateCspMetaTagInDocument', () => {
        it('returns html document with newly created meta tag', function () {
            const html = new JSDOM(`
                <html lang="en">
                    <head>
                        <title>dummy page</title>
                    </head>
                    <body>
                        <p>dummy content</p>
                    </body>
                </html>`);

            const result = updateCspMetaTagInDocument(html.window.document, 'script cspconsole.com;');

            expect(getCspValueFromMetaTag(result)).toEqual("script cspconsole.com;");
        });
    });
});
