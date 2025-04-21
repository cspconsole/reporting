import { Config, getCspMode, getReportUri, shouldUseDebugMode } from "../config/ConfigService";

type ApiReportPayload = {
    'blocked-uri': string;
    disposition: Config['mode'];
    'document-uri': string;
    'effective-directive': string;
    'original-policy': string;
    referrer: string;
    'status-code': number;
    'violated-directive': string;
}

function sendReportToApi(data: ApiReportPayload): void {
    fetch(getReportUri(), {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ 'csp-report': data })
    })
        .then(response => response.json())
        .then(data => {
            console.log('Success:', data);
        })
        .catch((error) => {
            console.error('Error:', error);
        });
}

export function reportViolation({
    directive,
    blockedUri,
    documentUrl,
    originalPolicy,
    referrer,
    statusCode
}: {
    directive: string;
    blockedUri: string;
    documentUrl: string;
    originalPolicy: string;
    referrer?: string;
    statusCode?: number;
}) {
    const data = {
        "blocked-uri": blockedUri,
        "disposition": getCspMode(),
        "document-uri": documentUrl,
        "effective-directive": directive,
        "original-policy": originalPolicy,
        "referrer": referrer ?? '',
        "status-code": statusCode ?? 200,
        "violated-directive": directive
    };

    if (shouldUseDebugMode()) {
        console.log('Violation report', data);
        return;
    }

    sendReportToApi(data);
}
