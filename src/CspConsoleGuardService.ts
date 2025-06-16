import { Config, getPolicies, initConfig } from "./config/ConfigService";
import { cspWebGuard } from "./guard/GuardService";
import { shouldUseEnforceMode } from "./config/ModeService";
import { getCspDirectivesForMimeType, guessMimeTypeFromUrl } from "./mime-type/MimeTypeService";
import { getCspConfigByRoute } from "./directives/DirectiveService";
import {
    getAllCspDirectivesByType,
    getPoliciesByDirective
} from "./directives/DirectiveParserService";
import { isUrlAllowedByDirectiveValue, normalizeCspDirectiveValue } from "./directives/DirectiveRegexService";
import { reportViolation } from "./reporting/ReportService";

type GuardConfig = Config & {
    onGuardInit?(): void;
};

export function cspConsoleWebGuard({ onGuardInit, policies, mode, reportUri, debug }: GuardConfig): void {
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
                                originalPolicy: getPoliciesByDirective(directives, mimeTypeBasedCspDirective)!,
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
