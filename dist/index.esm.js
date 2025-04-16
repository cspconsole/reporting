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

function guessMimeType(url) {
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
                    contentType: event.data?.contentType ?? guessMimeType(event.data?.url)
                };
                console.log('[SW Asset Fetched]', normalizedData);
            }
        });
    }
}

function getCspConfigByRoute(routes, currentUrl) {
    for (const { pathRegex, value } of routes) {
        if (new RegExp(pathRegex).test(currentUrl)) {
            return value;
        }
    }
    return undefined;
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
