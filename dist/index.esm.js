let appConfig = null;
const MISSING_CONFIG_ERROR = "Config has not been initialized.";
function initConfig(initialConfig) {
    if (appConfig) {
        throw new Error("Config has already been initialized.");
    }
    appConfig = Object.freeze({ ...initialConfig });
}
function getPolicies() {
    if (!appConfig) {
        throw new Error(MISSING_CONFIG_ERROR);
    }
    return appConfig.policies;
}
function getCspMode() {
    if (!appConfig) {
        throw new Error(MISSING_CONFIG_ERROR);
    }
    return appConfig.mode;
}
function getReportUri() {
    if (!appConfig) {
        throw new Error(MISSING_CONFIG_ERROR);
    }
    return appConfig.reportUri;
}
function shouldUseDebugMode() {
    if (!appConfig) {
        throw new Error(MISSING_CONFIG_ERROR);
    }
    return appConfig.debug;
}

function shouldUseEnforceMode() {
    return getCspMode() === 'enforce';
}
function shouldUseReportOnlyMode() {
    return getCspMode() === 'reportOnly';
}

function sendReportToApi(data) {
    fetch(getReportUri(), {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ 'csp-report': data })
    })
        .then(response => response.json())
        .then(data => {
        if (shouldUseDebugMode()) {
            console.log('Success:', data);
        }
    })
        .catch((error) => {
        if (shouldUseDebugMode()) {
            console.error('Error:', error);
        }
    });
}
function reportViolation({ directive, blockedUri, documentUrl, originalPolicy, referrer }) {
    const data = {
        "blocked-uri": blockedUri,
        "disposition": getCspMode(),
        "document-uri": documentUrl,
        "effective-directive": directive,
        "original-policy": originalPolicy,
        "referrer": referrer ?? '',
        "status-code": 200,
        "violated-directive": directive
    };
    if (shouldUseDebugMode()) {
        console.log('Violation report');
        console.log(data);
        console.log('-----------------');
    }
    sendReportToApi(data);
}

function cspWebGuard() {
    if (shouldUseReportOnlyMode()) {
        return;
    }
    window.addEventListener('securitypolicyviolation', function (event) {
        reportViolation({
            directive: event.effectiveDirective,
            blockedUri: event.blockedURI,
            documentUrl: event.documentURI,
            originalPolicy: event.originalPolicy,
            referrer: event.referrer
        });
    });
}

function guessMimeTypeFromUrl(url) {
    const extension = url.split('.').pop()?.split('?')[0].toLowerCase();
    if (!extension) {
        return 'application/octet-stream';
    }
    return {
        js: 'text/javascript',
        css: 'text/css',
        html: 'text/html',
        json: 'application/json',
        png: 'image/png',
        jpg: 'image/jpeg',
        jpeg: 'image/jpeg',
        gif: 'image/gif',
        svg: 'image/svg+xml',
        ico: 'image/x-icon',
        wasm: 'application/wasm',
    }[extension] || 'application/octet-stream';
}
function getCspDirectivesForMimeType(mimeType) {
    const mimeToDirectives = {
        // Scripts
        'application/javascript': ['script-src', 'script-src-elem', 'script-src-attr'],
        'application/x-javascript': ['script-src', 'script-src-elem', 'script-src-attr'],
        'text/javascript': ['script-src', 'script-src-elem', 'script-src-attr'],
        'application/ecmascript': ['script-src', 'script-src-elem', 'script-src-attr'],
        'text/ecmascript': ['script-src', 'script-src-elem', 'script-src-attr'],
        // Stylesheets
        'text/css': ['style-src', 'style-src-elem', 'style-src-attr'],
        // Images
        'image/png': ['img-src'],
        'image/jpeg': ['img-src'],
        'image/jpg': ['img-src'],
        'image/gif': ['img-src'],
        'image/webp': ['img-src'],
        'image/svg+xml': ['img-src'],
        'image/x-icon': ['img-src'],
        // Fonts
        'font/woff': ['font-src'],
        'font/woff2': ['font-src'],
        'application/font-woff': ['font-src'],
        'application/font-woff2': ['font-src'],
        'application/vnd.ms-fontobject': ['font-src'],
        'font/ttf': ['font-src'],
        'font/otf': ['font-src'],
        // Media
        'audio/mpeg': ['media-src'],
        'audio/ogg': ['media-src'],
        'audio/wav': ['media-src'],
        'video/mp4': ['media-src'],
        'video/webm': ['media-src'],
        'video/ogg': ['media-src'],
        // HTML documents
        'text/html': ['frame-src', 'child-src', 'default-src'],
        // JSON / data APIs
        'application/json': ['connect-src', 'default-src'],
        'application/xml': ['connect-src', 'default-src'],
        'text/xml': ['connect-src', 'default-src'],
        // WebAssembly
        'application/wasm': ['script-src'],
        // Others
        'application/pdf': ['object-src'],
        'application/octet-stream': ['object-src'],
    };
    return mimeToDirectives[mimeType] || [];
}

function getCspConfigByRoute(routes, currentUrl) {
    for (const { pathRegex, value } of routes) {
        if (new RegExp(pathRegex).test(currentUrl)) {
            return value;
        }
    }
    return undefined;
}

function extractCSPDirective(cspHeader, directive) {
    const directives = cspHeader.split(';').map(d => d.trim());
    for (const entry of directives) {
        const entryDirective = entry.split(' ')[0];
        if (entryDirective === directive) {
            return entry.slice(directive.length).trim();
        }
    }
    return null;
}
function getAllCspDirectivesByType({ cspHeader, type, selfReplacementUrl }) {
    const selfReplacements = [
        selfReplacementUrl ?? location.protocol + '//' + location.host,
        '/'
    ];
    if (cspHeader.indexOf(type) < 0) {
        return [];
    }
    const cspDirective = extractCSPDirective(cspHeader, type);
    if (!cspDirective) {
        return [];
    }
    const cspDirectives = cspDirective.split(' ').filter(val => val.length > 0).map(val => val.replace(/'/g, ""));
    return cspDirectives.flatMap(value => value === 'self' ? selfReplacements : value);
}

function normalizeCspDirectiveValue(value) {
    return value.replace('*', '[^\.]+');
}
function isUrlAllowedByDirectiveValue(value, url) {
    return new RegExp('^' + value).test(url);
}

function cspConsoleWebGuard({ onGuardInit, policies, mode, reportUri }) {
    initConfig({ policies, mode, reportUri });
    if (shouldUseEnforceMode()) {
        cspWebGuard();
        onGuardInit?.();
        return;
    }
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('/service-worker.js')
            .then(() => {
            // cspWebGuard();
            onGuardInit?.();
        }).catch((error) => {
            console.log('Service Worker registration failed:', error);
        });
        navigator.serviceWorker.addEventListener('message', (event) => {
            if (event.data?.type === 'ASSET_FETCHED') {
                const normalizedData = {
                    ...event.data,
                    contentType: event.data?.contentType ?? guessMimeTypeFromUrl(event.data?.url)
                };
                console.log('[SW Asset Fetched]', normalizedData);
                // get policies for current url
                const directives = getCspConfigByRoute(getPolicies(), window.location.href);
                if (!directives) {
                    return;
                }
                const directivesBasedOnMimeType = getCspDirectivesForMimeType(normalizedData.contentType);
                directivesBasedOnMimeType.forEach((mimeTypeBasedCspDirective) => {
                    const values = getAllCspDirectivesByType({ cspHeader: directives, type: mimeTypeBasedCspDirective });
                    values.forEach((value) => {
                        const normalizedValue = normalizeCspDirectiveValue(value);
                        if (!isUrlAllowedByDirectiveValue(normalizedValue, normalizedData.url)) {
                            reportViolation({
                                directive: mimeTypeBasedCspDirective,
                                blockedUri: normalizedData.url,
                                originalPolicy: directives,
                                documentUrl: window.location.href
                            });
                        }
                    });
                });
            }
        });
    }
}

function getMetaTag(html) {
    return html.querySelector('meta[http-equiv="content-security-policy"]');
}
function updateCspMetaTagInDocument(html, cspDirective) {
    const metaTag = getMetaTag(html);
    if (!metaTag) {
        const meta = html.createElement('meta');
        meta.setAttribute('http-equiv', 'content-security-policy');
        meta.setAttribute('content', cspDirective);
        html.head.appendChild(meta);
        return html;
    }
    metaTag?.setAttribute('content', cspDirective);
    return html;
}

function cspConsoleRouteGuard(currentUrl) {
    if (shouldUseReportOnlyMode()) {
        return;
    }
    const directives = getCspConfigByRoute(getPolicies(), currentUrl);
    updateCspMetaTagInDocument(document, directives ?? '');
}

export { cspConsoleRouteGuard, cspConsoleWebGuard };
//# sourceMappingURL=index.esm.js.map
