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

function shouldUseEnforceMode() {
    return getCspMode() === 'enforce';
}
function shouldUseReportOnlyMode() {
    return getCspMode() === 'reportOnly';
}

function cspWebGuard() {
    if (shouldUseEnforceMode()) {
        // THIS DOES NOT MAKE ANY SENSE...when this event occurs, browser already sent the report.
        // The policy violation is not cancellable, is purely informative
        window.addEventListener('securitypolicyviolation', function (event) {
            console.log('-----------------');
            console.log('violation happened');
            console.log(event.effectiveDirective, event.blockedURI, event.documentURI, event.originalPolicy, event.referrer);
            console.log('-----------------');
            // reportViolation(event.effectiveDirective, event.blockedURI, event.documentURI, event.originalPolicy, event.referrer);
        });
        return;
    }
}

function cspConsoleWebGuard({ onGuardInit, policies, mode, reportUri }) {
    initConfig({ policies, mode, reportUri });
    if (shouldUseEnforceMode()) {
        cspWebGuard();
        onGuardInit?.();
        return;
    }
    // THIS IS QUESTIONABLE WHERE TO GO WITH IT...
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('./service-worker.js')
            .then(() => {
            cspWebGuard();
            onGuardInit?.();
        }).catch((error) => {
            console.log('Service Worker registration failed:', error);
        });
    }
}

function getCspConfigByRoute(routes, currentUrl) {
    for (const { pathRegex, values } of routes) {
        if (new RegExp(pathRegex).test(currentUrl)) {
            return values;
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
