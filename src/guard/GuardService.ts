import { shouldUseEnforceMode } from "../config/ModeService";

export function cspWebGuard(): void {
    if (shouldUseEnforceMode()) {
        window.addEventListener('securitypolicyviolation', function(event) {
            console.log('Violation happened');
            console.log(event.effectiveDirective, event.blockedURI, event.documentURI, event.originalPolicy, event.referrer);
            console.log('-----------------');
            // reportViolation(event.effectiveDirective, event.blockedURI, event.documentURI, event.originalPolicy, event.referrer);
        });
        return;
    }

}
