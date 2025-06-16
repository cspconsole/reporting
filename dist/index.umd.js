(function (factory) {
    typeof define === 'function' && define.amd ? define(factory) :
    factory();
})((function () { 'use strict';

    function cspConsoleReporting(reportUrl) {
        console.log('CSP Console Reporting initialized with report URL:', reportUrl);
        window.addEventListener('securitypolicyviolation', function (event) {
            const violationDetails = {
                blockedURI: event.blockedURI,
                violatedDirective: event.violatedDirective,
                sourceFile: event.sourceFile,
                lineNumber: event.lineNumber,
                columnNumber: event.columnNumber,
                statusCode: event.statusCode,
            };
            console.log('Reporting CSP violation from package:', violationDetails);
            fetch(reportUrl, {
                method: 'POST',
                body: JSON.stringify(violationDetails),
                headers: { 'Content-Type': 'application/json' },
            })
                .then(response => response.json())
                .then(data => {
                console.log('CSP violation report sent:', data);
            })
                .catch(error => {
                console.error('Error sending CSP violation report:', error);
            });
        });
    }

    (function (global, factory) {
        if (typeof module === 'object' && typeof module.exports === 'object') {
            module.exports = factory();
        }
        else { // @ts-expect-error define function is part of the Asynchronous Module Definition (AMD) module system, typically used with module loaders like RequireJS
            if (typeof define === 'function' && define.amd) {
                // @ts-expect-error define function is part of the Asynchronous Module Definition (AMD) module system, typically used with module loaders like RequireJS
                define([], factory);
            }
            else {
                // @ts-expect-error TypeScript doesn't know what global is in this context
                global.cspConsoleReporting = factory();
            }
        }
    }(typeof globalThis !== 'undefined' ? globalThis : typeof self !== 'undefined' ? self : window, function () {
        return cspConsoleReporting;
    }));

}));
//# sourceMappingURL=index.umd.js.map
