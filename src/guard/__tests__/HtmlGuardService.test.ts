import { htmlGuard } from "../HtmlGuardService";
import { JSDOM } from "jsdom";

describe('HtmlGuardService', () => {
    describe('htmlGuard', () => {
        it("should correctly block or allow elements based on CSP config", () => {
            const CSP_HEADER = "default-src 'self'; child-src 'self'; connect-src 'self'; font-src 'self'; form-action 'self'; frame-ancestors 'self'; frame-src 'self'; img-src 'self'; manifest-src 'self'; media-src 'self'; object-src 'self'; script-src 'self' https://cdn.cspconsole.com 'nonce-abc123'; style-src 'self' https://fonts.googleapis.com;";

            const htmlContent = `
              <html>
                <head>
                  <!-- style with inline content -->
                  <style id="style-inline">body { background: white; }</style>
        
                  <!-- style with href, allowed -->
                  <link id="link-allowed" rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Roboto">
        
                  <!-- style with href, blocked -->
                  <link id="link-blocked" rel="stylesheet" href="https://malicious.com/style.css">
                </head>
                <body>
                  <!-- script with matching nonce -->
                  <script id="script-nonce-match" nonce="abc123" src="https://cdn.cspconsole.com/script.js"></script>
        
                  <!-- script with non-matching nonce -->
                  <script id="script-nonce-mismatch" nonce="wrongnonce" src="https://cdn.cspconsole.com/script.js"></script>
        
                  <!-- inline script -->
                  <script id="script-inline">console.log('Hello')</script>
        
                  <!-- script with src, allowed -->
                  <script id="script-src-allowed" src="https://cdn.cspconsole.com/script.js"></script>
        
                  <!-- script with src, blocked -->
                  <script id="script-src-blocked" src="https://malicious.com/evil.js"></script>
        
                  <!-- img with src, blocked -->
                  <img id="img-blocked" src="https://evil.com/image.jpg" />
        
                  <!-- img with src, allowed -->
                  <img id="img-allowed" src="selfie.png" />
        
                  <!-- iframe with src, blocked -->
                  <iframe id="iframe-blocked" src="https://notself.com/embed.html"></iframe>
                </body>
              </html>
            `;

            const dom = new JSDOM(htmlContent);
            const { document } = dom.window;

            // Execute htmlGuard with the defined CSP header
            htmlGuard({ html: document, allowedDirectives: CSP_HEADER });

            // --- Style inline should remain with innerHTML wrapped in comment ---
            const styleInline = document.getElementById("style-inline")!;

            expect(styleInline.getAttribute("data-csp-result")).toBe("disabled");
            expect(styleInline.innerHTML.trim()).toMatch(/^\/\*.*\*\/$/);

            // --- Allowed stylesheet link should remain unchanged ---
            const linkAllowed = document.getElementById("link-allowed")!;
            expect(linkAllowed.getAttribute("href")).toBe("https://fonts.googleapis.com/css2?family=Roboto");

            // --- Blocked stylesheet link should have href removed and data-csp-src set ---
            const linkBlocked = document.getElementById("link-blocked")!;
            expect(linkBlocked.hasAttribute("href")).toBe(false);
            expect(linkBlocked.getAttribute("data-csp-src")).toBe("https://malicious.com/style.css");

            // --- Script with matching nonce should be unblocked ---
            const scriptNonceMatch = document.getElementById("script-nonce-match")!;
            expect(scriptNonceMatch.getAttribute("src")).toBe("https://cdn.cspconsole.com/script.js");
            expect(scriptNonceMatch.hasAttribute("data-csp-src")).toBe(false);

            // --- Script with wrong nonce should be blocked ---
            const scriptNonceMismatch = document.getElementById("script-nonce-mismatch")!;
            expect(scriptNonceMismatch.hasAttribute("src")).toBe(false);
            expect(scriptNonceMismatch.getAttribute("data-csp-src")).toBe("https://cdn.cspconsole.com/script.js");

            // --- Inline script should be wrapped in a comment ---
            const scriptInline = document.getElementById("script-inline")!;
            expect(scriptInline.getAttribute("data-csp-result")).toBe("disabled");
            expect(scriptInline.innerHTML.trim()).toMatch(/^\/\*.*\*\/$/);

            // --- Script with allowed src should stay as-is ---
            const scriptAllowed = document.getElementById("script-src-allowed")!;
            expect(scriptAllowed.getAttribute("src")).toBe("https://cdn.cspconsole.com/script.js");

            // --- Script with blocked src should be stripped and data-csp-src set ---
            const scriptBlocked = document.getElementById("script-src-blocked")!;
            expect(scriptBlocked.hasAttribute("src")).toBe(false);
            expect(scriptBlocked.getAttribute("data-csp-src")).toBe("https://malicious.com/evil.js");

            // --- Image with blocked src should be stripped ---
            const imgBlocked = document.getElementById("img-blocked")!;
            expect(imgBlocked.hasAttribute("src")).toBe(false);
            expect(imgBlocked.getAttribute("data-csp-src")).toBe("https://evil.com/image.jpg");

            // --- Image with allowed src (same-origin) should stay as-is ---
            const imgAllowed = document.getElementById("img-allowed")!;
            expect(imgAllowed.getAttribute("src")).toBe("selfie.png");

            // --- Iframe with blocked src should be stripped ---
            const iframeBlocked = document.getElementById("iframe-blocked")!;
            expect(iframeBlocked.hasAttribute("src")).toBe(false);
            expect(iframeBlocked.getAttribute("data-csp-src")).toBe("https://notself.com/embed.html");

            // --- Now test a re-run with a CSP that allows all content back ---
            const relaxedCSP = "script-src 'unsafe-inline' https://cdn.cspconsole.com; style-src 'unsafe-inline'; img-src *; frame-src *;";
            htmlGuard({ html: document, allowedDirectives: relaxedCSP });

            // After relaxed CSP, the previously blocked script should not be restored
            expect(scriptBlocked.hasAttribute("src")).toBe(false);
            expect(scriptBlocked.getAttribute("data-csp-result")).toBe("disabled");

            // Previously blocked image should be restored
            expect(imgBlocked.getAttribute("src")).toBe("https://evil.com/image.jpg");

            // Previously blocked iframe should be restored
            expect(iframeBlocked.getAttribute("src")).toBe("https://notself.com/embed.html");

            // Inline script should now be unwrapped
            expect(scriptInline.getAttribute("data-csp-result")).toBe(null);
            expect(scriptInline.innerHTML).toContain("console.log");
        });

        it("should allow wildcard '*' in directives (e.g. img-src *)", () => {
            const CSP_HEADER = "img-src *; script-src 'self';";

            const htmlContent = `
                <html><body>
                  <img id="img-allowed" src="https://anydomain.com/pic.png" />
                  <script id="script-blocked" src="https://notallowed.com/app.js"></script>
                </body></html>
            `;

            const dom = new JSDOM(htmlContent);
            const { document } = dom.window;

            htmlGuard({ html: document, allowedDirectives: CSP_HEADER });

            const imgAllowed = document.getElementById("img-allowed")!;
            expect(imgAllowed.getAttribute("src")).toBe("https://anydomain.com/pic.png");
            expect(imgAllowed.hasAttribute("data-csp-src")).toBe(false);

            const scriptBlocked = document.getElementById("script-blocked")!;
            expect(scriptBlocked.hasAttribute("src")).toBe(false);
            expect(scriptBlocked.getAttribute("data-csp-src")).toBe("https://notallowed.com/app.js");
        });

        it("should block all when directive is missing for element type", () => {
            const CSP_HEADER = "script-src 'self';"; // no img-src directive at all

            const htmlContent = `
                <html><body>
                  <img id="img-blocked" src="https://someimage.com/img.png" />
                  <script id="script-allowed" src="https://yourdomain.com/app.js"></script>
                </body></html>
            `;

            const dom = new JSDOM(htmlContent);
            const { document } = dom.window;

            htmlGuard({ html: document, allowedDirectives: CSP_HEADER, selfReplacementUrl: 'https://yourdomain.com' });

            const imgBlocked = document.getElementById("img-blocked")!;
            expect(imgBlocked.hasAttribute("src")).toBe(false);
            expect(imgBlocked.getAttribute("data-csp-src")).toBe("https://someimage.com/img.png");

            const scriptAllowed = document.getElementById("script-allowed")!;
            expect(scriptAllowed.getAttribute("src")).toBe("https://yourdomain.com/app.js");
        });

        it("should correctly handle multiple allowed domains in directive", () => {
            const CSP_HEADER = "script-src https://cdn1.com https://cdn2.com;";

            const htmlContent = `
                <html><body>
                  <script id="script-cdn1" src="https://cdn1.com/lib.js"></script>
                  <script id="script-cdn2" src="https://cdn2.com/lib.js"></script>
                  <script id="script-other" src="https://other.com/lib.js"></script>
                </body></html>
            `;

            const dom = new JSDOM(htmlContent);
            const { document } = dom.window;

            htmlGuard({ html: document, allowedDirectives: CSP_HEADER });

            expect(document.getElementById("script-cdn1")!.getAttribute("src")).toBe("https://cdn1.com/lib.js");
            expect(document.getElementById("script-cdn2")!.getAttribute("src")).toBe("https://cdn2.com/lib.js");

            const scriptOther = document.getElementById("script-other")!;
            expect(scriptOther.hasAttribute("src")).toBe(false);
            expect(scriptOther.getAttribute("data-csp-src")).toBe("https://other.com/lib.js");
        });

        it("should block inline scripts if 'unsafe-inline' is missing from script-src", () => {
            const CSP_HEADER = "script-src https://cdn.cspconsole.com;";

            const htmlContent = `
                <html><body>
                  <script id="script-inline">console.log('inline');</script>
                  <script id="script-src" src="https://cdn.cspconsole.com/app.js"></script>
                </body></html>
            `;

            const dom = new JSDOM(htmlContent);
            const { document } = dom.window;

            htmlGuard({ html: document, allowedDirectives: CSP_HEADER });

            const scriptInline = document.getElementById("script-inline")!;
            expect(scriptInline.getAttribute("data-csp-result")).toBe("disabled");
            expect(scriptInline.innerHTML.trim()).toMatch(/^\/\*.*\*\/$/);

            const scriptSrc = document.getElementById("script-src")!;
            expect(scriptSrc.getAttribute("src")).toBe("https://cdn.cspconsole.com/app.js");
        });

        it("should allow inline styles if 'unsafe-inline' is present in style-src", () => {
            const CSP_HEADER = "style-src 'unsafe-inline';";

            const htmlContent = `
                <html><head>
                  <style id="style-inline">body { color: red; }</style>
                </head><body></body></html>
            `;

            const dom = new JSDOM(htmlContent);
            const { document } = dom.window;

            htmlGuard({ html: document, allowedDirectives: CSP_HEADER });

            const styleInline = document.getElementById("style-inline")!;
            expect(styleInline.getAttribute("data-csp-result")).toBe(null);
            expect(styleInline.innerHTML.trim()).toBe("body { color: red; }");
        });

        it("should handle relative URLs in src/href correctly against 'self'", () => {
            const CSP_HEADER = "img-src 'self';";

            const htmlContent = `
                <html><body>
                  <img id="img-relative1" src="/images/pic1.png" />
                  <img id="img-relative2" src="pic2.png" />
                  <img id="img-external" src="https://external.com/pic3.png" />
                </body></html>
            `;

            const dom = new JSDOM(htmlContent, { url: "https://example.com/" });
            const { document } = dom.window;

            htmlGuard({ html: document, allowedDirectives: CSP_HEADER });

            const imgRel1 = document.getElementById("img-relative1")!;
            expect(imgRel1.getAttribute("src")).toBe("/images/pic1.png");

            const imgRel2 = document.getElementById("img-relative2")!;
            expect(imgRel2.getAttribute("src")).toBe("pic2.png");

            const imgExternal = document.getElementById("img-external")!;
            expect(imgExternal.hasAttribute("src")).toBe(false);
            expect(imgExternal.getAttribute("data-csp-src")).toBe("https://external.com/pic3.png");
        });
    });

    it("should handle wildcard (*) directive correctly", () => {
        const CSP_HEADER = "img-src *;";
        const htmlContent = `
          <html>
            <body>
              <img id="img-any-domain" src="https://anything.com/image.png" />
              <img id="img-relative" src="/assets/img.png" />
            </body>
          </html>
        `;

        const dom = new JSDOM(htmlContent);
        const { document } = dom.window;

        htmlGuard({ html: document, allowedDirectives: CSP_HEADER });

        const imgAny = document.getElementById("img-any-domain")!;
        const imgRelative = document.getElementById("img-relative")!;

        expect(imgAny.getAttribute("src")).toBe("https://anything.com/image.png");
        expect(imgRelative.getAttribute("src")).toBe("/assets/img.png");
    });

    it("should block all external resources when only 'self' is allowed", () => {
        const CSP_HEADER = "script-src 'self';";
        const htmlContent = `
          <html>
            <body>
              <script id="script-self" src="/main.js"></script>
              <script id="script-external" src="https://cdn.extern.com/lib.js"></script>
            </body>
          </html>
        `;

        const dom = new JSDOM(htmlContent);
        const { document } = dom.window;

        htmlGuard({ html: document, allowedDirectives: CSP_HEADER });

        const scriptSelf = document.getElementById("script-self")!;
        const scriptExternal = document.getElementById("script-external")!;

        expect(scriptSelf.getAttribute("src")).toBe("/main.js");
        expect(scriptExternal.hasAttribute("src")).toBe(false);
        expect(scriptExternal.getAttribute("data-csp-src")).toBe("https://cdn.extern.com/lib.js");
    });

    it("should handle mixed inline and external scripts with and without nonce", () => {
        const CSP_HEADER = "script-src 'self' 'nonce-12345';";
        const htmlContent = `
          <html>
            <body>
              <script id="script-inline-no-nonce">alert('x');</script>
              <script id="script-inline-nonce" nonce="12345">alert('y');</script>
              <script id="script-external" src="https://cdn.extern.com/lib.js"></script>
            </body>
          </html>
        `;

        const dom = new JSDOM(htmlContent);
        const { document } = dom.window;

        htmlGuard({ html: document, allowedDirectives: CSP_HEADER });

        const inlineNoNonce = document.getElementById("script-inline-no-nonce")!;
        const inlineNonce = document.getElementById("script-inline-nonce")!;
        const external = document.getElementById("script-external")!;

        expect(inlineNoNonce.getAttribute("data-csp-result")).toBe("disabled");
        expect(inlineNonce.innerHTML).toContain("alert('y');");
        expect(external.hasAttribute("src")).toBe(false);
    });

    it("should respect multiple allowed sources in CSP", () => {
        const CSP_HEADER = "script-src 'self' https://trusted.com;";
        const htmlContent = `
          <html>
            <body>
              <script id="script-self" src="/js/app.js"></script>
              <script id="script-trusted" src="https://trusted.com/script.js"></script>
              <script id="script-untrusted" src="https://evil.com/script.js"></script>
            </body>
          </html>
        `;

        const dom = new JSDOM(htmlContent);
        const { document } = dom.window;

        htmlGuard({ html: document, allowedDirectives: CSP_HEADER });

        expect(document.getElementById("script-self")!.getAttribute("src")).toBe("/js/app.js");
        expect(document.getElementById("script-trusted")!.getAttribute("src")).toBe("https://trusted.com/script.js");
        expect(document.getElementById("script-untrusted")!.hasAttribute("src")).toBe(false);
        expect(document.getElementById("script-untrusted")!.getAttribute("data-csp-src")).toBe("https://evil.com/script.js");
    });
});
