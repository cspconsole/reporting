import { cspConsoleReporting } from "./reporter";

(function (global, factory) {
    if (typeof module === 'object' && typeof module.exports === 'object') {
        module.exports = factory();
    } else { // @ts-expect-error define function is part of the Asynchronous Module Definition (AMD) module system, typically used with module loaders like RequireJS
        if (typeof define === 'function' && define.amd) {
            // @ts-expect-error define function is part of the Asynchronous Module Definition (AMD) module system, typically used with module loaders like RequireJS
            define([], factory);
        } else {
            // @ts-expect-error TypeScript doesn't know what global is in this context
            global.cspConsoleReporting = factory();
        }
    }
}(typeof globalThis !== 'undefined' ? globalThis : typeof self !== 'undefined' ? self : this, function () {
    return cspConsoleReporting;
}));
