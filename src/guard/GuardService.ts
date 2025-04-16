import { shouldUseReportOnlyMode } from "../config/ModeService";
import { reportViolation } from "../reporting/ReportService";

export function cspWebGuard(): void {
    if (shouldUseReportOnlyMode()) {
        return;
    }

    window.addEventListener('securitypolicyviolation', function(event) {
        reportViolation({
            directive: event.effectiveDirective,
            blockedUri: event.blockedURI,
            documentUrl: event.documentURI,
            originalPolicy:event.originalPolicy,
            referrer: event.referrer
        });
    });
}
