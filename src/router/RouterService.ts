import { getCspConfigByRoute } from "../directives/DirectiveService";
import { updateCspMetaTagInDocument } from "../document-parser/MetaTagService";
import { getPolicies } from "../config/ConfigService";
import { shouldUseReportOnlyMode } from "../config/ModeService";
import { htmlGuard } from "../guard/HtmlGuardService";

export function cspConsoleRouteGuard(currentUrl: string): void {
    if (shouldUseReportOnlyMode()) {
        return;
    }
    
    const directives = getCspConfigByRoute(getPolicies(), currentUrl);
    updateCspMetaTagInDocument(document, directives ?? '');
    htmlGuard({ html: document, allowedDirectives: directives });
}
