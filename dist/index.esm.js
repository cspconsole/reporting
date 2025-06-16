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
        console.log('Success:', data);
    })
        .catch((error) => {
        console.error('Error:', error);
    });
}
function reportViolation({ directive, blockedUri, documentUrl, originalPolicy, referrer, statusCode }) {
    const data = {
        "blocked-uri": blockedUri,
        "disposition": getCspMode(),
        "document-uri": documentUrl,
        "effective-directive": directive,
        "original-policy": originalPolicy,
        "referrer": referrer ?? '',
        "status-code": statusCode ?? 200,
        "violated-directive": directive
    };
    if (shouldUseDebugMode()) {
        console.log('Violation report', data);
        return;
    }
    sendReportToApi(data);
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
function getPoliciesByDirective(cspHeader, directive) {
    const extractedCSPDirective = extractCSPDirective(cspHeader, directive);
    if (!extractedCSPDirective) {
        return null;
    }
    return `${directive} ${extractedCSPDirective};`;
}
function getAllCspDirectivesByType({ cspHeader, type, selfReplacementUrl }) {
    const selfReplacements = [
        selfReplacementUrl ?? location.origin
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

function cspWebGuard() {
    if (shouldUseReportOnlyMode()) {
        return;
    }
    window.addEventListener('securitypolicyviolation', function (event) {
        const directive = event.effectiveDirective ?? event.violatedDirective;
        reportViolation({
            directive,
            blockedUri: event.blockedURI,
            documentUrl: event.documentURI,
            originalPolicy: getPoliciesByDirective(event.originalPolicy, directive),
            referrer: event.referrer,
            statusCode: event.statusCode
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

function isUnsafeInline(directiveValue) {
    return directiveValue === 'unsafe-inline';
}
function getCspConfigByRoute(routes, currentUrl) {
    for (const { pathRegex, value } of routes) {
        if (new RegExp(pathRegex).test(currentUrl)) {
            return value;
        }
    }
    return undefined;
}

function normalizeCspDirectiveValue(value) {
    return value.replace('*', '[^\.]+');
}
function isUrlAllowedByDirectiveValue(value, url) {
    return new RegExp('^' + value).test(url);
}

function cspConsoleWebGuard({ onGuardInit, policies, mode, reportUri, debug }) {
    initConfig({ policies, mode, reportUri, debug });
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
                const directives = getCspConfigByRoute(getPolicies(), window.location.href);
                if (!directives) {
                    return;
                }
                const directivesBasedOnMimeType = getCspDirectivesForMimeType(normalizedData.contentType);
                directivesBasedOnMimeType.forEach((mimeTypeBasedCspDirective) => {
                    const values = getAllCspDirectivesByType({ cspHeader: directives, type: mimeTypeBasedCspDirective });
                    for (const value of values) {
                        const normalizedValue = normalizeCspDirectiveValue(value);
                        if (!isUrlAllowedByDirectiveValue(normalizedValue, normalizedData.url)) {
                            reportViolation({
                                directive: mimeTypeBasedCspDirective,
                                blockedUri: normalizedData.url,
                                originalPolicy: getPoliciesByDirective(directives, mimeTypeBasedCspDirective),
                                documentUrl: window.location.href,
                                statusCode: normalizedData.status
                            });
                            return;
                        }
                    }
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

function hasElementSrc(element) {
    return !!element.getAttribute('src');
}
function hasElementHref(element) {
    return !!element.getAttribute('href');
}
function isElementWithNonceAndSrc(element) {
    const nonce = element.getAttribute('nonce');
    if (!nonce) {
        return false;
    }
    return hasElementSrc(element);
}
function isElementDataCspSrc(element) {
    return element.getAttribute('data-csp-attr') === 'src';
}
function isElementDataCspHref(element) {
    return element.getAttribute('data-csp-attr') === 'href';
}
function isElementDataCspResult(element) {
    return !!element.getAttribute('data-csp-result');
}
function isElementScriptOrStyle(element) {
    return element.tagName.toLowerCase() === 'script' || element.tagName.toLowerCase() === 'style';
}
function isNonceMatchingDirectiveValue({ element, directiveValue }) {
    return element.getAttribute('nonce') === directiveValue.replace('nonce-', '');
}
function isElementAttrMatchingDirectiveRegex({ element, attrName, regex, }) {
    if (regex === '*') {
        return true;
    }
    try {
        const rawAttr = element.getAttribute(attrName);
        if (!rawAttr) {
            return false;
        }
        const resolvedUrl = new URL(rawAttr, document.baseURI).href;
        return new RegExp(regex).test(resolvedUrl);
    }
    catch {
        return false;
    }
}
function isSrcElementMatchingDirectiveValueRegex({ element, regex }) {
    if (!hasElementSrc(element)) {
        return false;
    }
    return isElementAttrMatchingDirectiveRegex({ element, attrName: 'src', regex });
}
function isCspDataSrcElementMatchingDirectiveValueRegex({ element, regex }) {
    if (!isElementDataCspSrc(element)) {
        return false;
    }
    let attribute = element.getAttribute('data-csp-src');
    if (!attribute) {
        return false;
    }
    return isElementAttrMatchingDirectiveRegex({ element, attrName: 'data-csp-src', regex });
}
function isHrefElementMatchingDirectiveValueRegex({ element, regex }) {
    if (!hasElementHref(element)) {
        return false;
    }
    return isElementAttrMatchingDirectiveRegex({ element, attrName: 'href', regex });
}
function isCspDataHrefElementMatchingDirectiveValueRegex({ element, regex }) {
    if (!isElementDataCspHref(element)) {
        return false;
    }
    let attribute = element.getAttribute('data-csp-src');
    if (!attribute) {
        return false;
    }
    return isElementAttrMatchingDirectiveRegex({ element, attrName: 'data-csp-href', regex });
}

const HTML_ELEMENTS = {
    'script': 'script-src',
    'style': 'style-src',
    'link[rel="stylesheet"]': 'style-src',
    'img': 'img-src',
    'iframe': 'frame-src',
};
function blockSrcElement(element) {
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
function unlockSrcElement(element) {
    if (!isElementDataCspSrc(element)) {
        return;
    }
    element.setAttribute('src', element.getAttribute('data-csp-src'));
    removeDataCspAttributes(element);
}
function blockHrefElement(element) {
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
function unlockHrefElement(element) {
    if (!isElementDataCspHref(element)) {
        return;
    }
    element.setAttribute('href', element.getAttribute('data-csp-src'));
    removeDataCspAttributes(element);
}
function addDataCspResultAttribute(element) {
    element.setAttribute('data-csp-result', 'disabled');
}
function removeDataCspAttributes(element) {
    element.removeAttribute('data-csp-src');
    element.removeAttribute('data-csp-attr');
    element.removeAttribute('data-csp-result');
}
function blockUnsafeInline(element) {
    if (isElementDataCspResult(element)) {
        return;
    }
    element.setAttribute('data-csp-result', 'disabled');
    element.innerHTML = '/*' + element.innerHTML + '*/';
}
function unlockUnsafeInline(element) {
    if (!isElementDataCspResult(element)) {
        return;
    }
    element.removeAttribute('data-csp-result');
    element.innerHTML = element.innerHTML.trim().replace(/^\/\*/, '').replace(/\*\/$/, '');
}
function guardHtmlElement(element, values) {
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
        }
        else {
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
        }
        else {
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
        if (isMatchingDataSrc) {
            if (isElementDataCspResult(element)) {
                unlockSrcElement(element);
                return;
            }
        }
        else {
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
        }
        else {
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
        }
        else {
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
function htmlGuard({ html = document, allowedDirectives, selfReplacementUrl }) {
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

function cspConsoleRouteGuard(currentUrl) {
    if (shouldUseReportOnlyMode()) {
        return;
    }
    const directives = getCspConfigByRoute(getPolicies(), currentUrl);
    updateCspMetaTagInDocument(document, directives ?? '');
    htmlGuard({ html: document, allowedDirectives: directives });
}

export { cspConsoleRouteGuard, cspConsoleWebGuard };
//# sourceMappingURL=index.esm.js.map
