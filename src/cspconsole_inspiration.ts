router.beforeEach((to, from, next) => {
    const metaTag = document.querySelector('meta[http-equiv="content-security-policy"]');
    const cachedCspValue = store.state.cspValue;
    //cspData = json
    for (let i = 0; i < cspData.values.length; i++) {
        const allowedDirectives = cspData.values[i];
        if (new RegExp(allowedDirectives.pathRegex).test(to.path)) {
            if (!metaTag || allowedDirectives.value !== cachedCspValue) {
                store.dispatch('setCspValue', allowedDirectives.value).then(() => {
                    if (metaTag) {
                        metaTag.setAttribute('content', allowedDirectives.value);
                    } else {
                        const meta = document.createElement('meta');
                        meta.setAttribute('http-equiv', 'content-security-policy');
                        meta.setAttribute('content', allowedDirectives.value);
                        document.head.appendChild(meta);
                    }
                    clearData(allowedDirectives.value);
                    next();
                });
            } else {
                document.title = to?.meta?.title
                    ? to.meta.title + " | CSP Management Console"
                    : "CSP Management Console";
                next();
            }
            return ;
        }
    }

    document.title = to?.meta?.title
        ? to.meta.title + " | CSP Management Console"
        : "CSP Management Console";
    next();
});

function clearData(allowedAllDirectives) {
    const nodeNames = {
        'script': 'script-src',
        'style': 'style-src',
        'link[rel="stylesheet"]': 'style-src',
        'img': 'img-src',
        'iframe': 'frame-src',
    };

    const rules = {
        "'self'": [location.protocol + '//' + location.host, '/'],
    }

    Object.entries(nodeNames).forEach(([nodeName, cspDirective]) => {
        const elements = document.querySelectorAll(nodeName);
        let part1 = allowedAllDirectives.slice(allowedAllDirectives.indexOf(cspDirective) + cspDirective.length).trim();

        if(part1.indexOf(';') > 0) {
            part1 = part1.slice(0, part1.indexOf(';')).trim();
        }
        const allowedDirectives = part1.split(' ');
        let validElements = [];
        allowedDirectives.forEach((allowedDirective) => {

            let selectedRules = [allowedDirective]
            if (allowedDirective in rules) {
                selectedRules = rules[allowedDirective];
            }

            selectedRules.forEach((allowedDirective) => {
                const regexAllowedDirective = allowedDirective.replace('*', '[^\.]+')
                elements.forEach((element) => {
                    if (element.getAttribute('nonce') && element.src) {
                        if (element.getAttribute('nonce') === allowedDirective) {
                            validElements.push(element.src);
                        }
                    } else if (element.src) {
                        if (new RegExp('^' + regexAllowedDirective).test(element.src)) {
                            validElements.push(element.src);
                        }
                    } else if (element.getAttribute('data-csp-src')) {
                        if (new RegExp('^' + regexAllowedDirective).test(element.getAttribute('data-csp-src'))) {
                            validElements.push(element.getAttribute('data-csp-src'));
                        }
                    } else if (element.href) {
                        if (new RegExp('^' + regexAllowedDirective).test(element.href)) {
                            validElements.push(element.href);
                        }
                    } else if (element.getAttribute('data-csp-href')) {
                        if (new RegExp('^' + regexAllowedDirective).test(element.getAttribute('data-csp-href'))) {
                            validElements.push(element.getAttribute('data-csp-href'));
                        }
                    } else if (['script', 'style'].includes(nodeName) && allowedDirective === "'unsafe-inline'") {
                        //calculate md5 string of element.value
                        validElements.push(CryptoJS.MD5(element.textContent).toString());
                    }
                });
            });
        });

        elements.forEach((element) => {
            if (element?.src && !validElements.includes(element.src)) {
                element.setAttribute('data-csp-src', element.src);
                element.setAttribute('data-csp-attr', 'src');
                element.setAttribute('data-csp-elem', 'disabled');
                element.removeAttribute('src');
                reportViolation(cspDirective, element.src, location.href, allowedAllDirectives, document.referrer);
            } else if (element?.href && !validElements.includes(element.href)) {
                element.setAttribute('data-csp-src', element.href);
                element.setAttribute('data-csp-attr', 'href');
                element.setAttribute('data-csp-elem', 'disabled');
                element.removeAttribute('href');
                reportViolation(cspDirective, element.href, location.href, allowedAllDirectives, document.referrer);
            } else if (element.getAttribute('data-csp-src') && validElements.includes(element.getAttribute('data-csp-src'))) {
                element.setAttribute(element.getAttribute('data-csp-attr'), element.getAttribute('data-csp-src'));
                element.removeAttribute('data-csp-src');
                element.removeAttribute('data-csp-attr');
                element.removeAttribute('data-csp-elem');
            } else if (!element?.src && !element?.href && ['script', 'style'].includes(nodeName) && !element.getAttribute('data-csp-elem') && !validElements.includes(CryptoJS.MD5(element.textContent).toString())) {
                element.setAttribute('data-csp-elem', 'disabled');
                element.innerHTML = '/*' + element.innerHTML + '*/';
                reportViolation(cspDirective, "'unsafe-inline'", location.href, allowedAllDirectives, document.referrer);
            } else if(!element?.src && !element?.href && ['script', 'style'].includes(nodeName) && element.getAttribute('data-csp-elem') && validElements.includes(CryptoJS.MD5(element.textContent).toString())) {
                element.removeAttribute('data-csp-elem');
                element.innerHTML = element.innerHTML.trim().replace(/^\/\*/, '').replace(/\*\/$/, '');
            }
        });
    });
}

window.addEventListener('securitypolicyviolation', function(event) {
    reportViolation(event.effectiveDirective, event.blockedURI, event.documentURI, event.originalPolicy, event.referrer);
});

function reportViolation(directive, blockedUri, documentUrl, originalPolicy, referrer) {
    const url = 'https://app-cspconsole-com-d172968e.api.cspconsole.com/v1/reports';
    const data = {
        "csp-report": {
            "blocked-uri": blockedUri,
            "disposition": "enforce",
            "document-uri": documentUrl,
            "effective-directive": directive,
            "original-policy": originalPolicy,
            "referrer": referrer,
            "status-code": 200,
            "violated-directive": directive
        }
    };

    fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
    })
        .then(response => response.json())
        .then(data => {
            console.log('Success:', data);
        })
        .catch((error) => {
            console.error('Error:', error);
        });
}
