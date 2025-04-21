import { shouldUseReportOnlyMode } from "../config/ModeService";
import { reportViolation } from "../reporting/ReportService";
import { getPoliciesByDirective } from "../directives/DirectiveParserService";

export function cspWebGuard(): void {
    if (shouldUseReportOnlyMode()) {
        return;
    }

    window.addEventListener('securitypolicyviolation', function(event) {
        const directive = event.effectiveDirective ?? event.violatedDirective;

        reportViolation({
            directive,
            blockedUri: event.blockedURI,
            documentUrl: event.documentURI,
            originalPolicy: getPoliciesByDirective(event.originalPolicy, directive)!,
            referrer: event.referrer,
            statusCode: event.statusCode
        });
    });
}
