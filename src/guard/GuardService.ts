import { shouldUseEnforceMode } from "../config/ModeService";

export function cspWebGuard(): void {
    if (shouldUseEnforceMode()) {
        // THIS DOES NOT MAKE ANY SENSE...when this event occurs, browser already sent the report.
        // The policy violation is not cancellable, is purely informative
        window.addEventListener('securitypolicyviolation', function(event) {
            // reportViolation(event.effectiveDirective, event.blockedURI, event.documentURI, event.originalPolicy, event.referrer);
        });
        return;
    }

}
