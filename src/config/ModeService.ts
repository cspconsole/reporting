import { getCspMode } from "./ConfigService";

export function shouldUseEnforceMode(): boolean {
    return getCspMode() === 'enforce';
}

export function shouldUseReportOnlyMode(): boolean {
    return getCspMode() === 'reportOnly';
}
