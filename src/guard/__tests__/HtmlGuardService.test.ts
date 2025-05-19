import { htmlGuard } from "../HtmlGuardService";
import { JSDOM } from "jsdom";

describe('HtmlGuardService', () => {
    describe('htmlGuard', () => {
        it("should correctly block or allow elements based on CSP config", () => {
            const CSP_HEADER = "default-src 'self'; child-src 'self'; connect-src 'self'; font-src 'self'; form-action 'self'; frame-ancestors 'self'; frame-src 'self'; img-src 'self'; manifest-src 'self'; media-src 'self'; object-src 'self'; script-src 'self' 'unsafe-inline' https://cdn.cspconsole.com 'nonce-abc123'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;";

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
            console.log(imgBlocked.outerHTML);
            expect(imgBlocked.getAttribute("src")).toBe("https://evil.com/image.jpg");

            // Previously blocked iframe should be restored
            expect(iframeBlocked.getAttribute("src")).toBe("https://notself.com/embed.html");

            // Inline script should now be unwrapped
            expect(scriptInline.getAttribute("data-csp-result")).toBe(null);
            expect(scriptInline.innerHTML).toContain("console.log");
        });
    });
});
