import { Config, initConfig } from "./config/ConfigService";
import { cspWebGuard } from "./guard/GuardService";
import { shouldUseEnforceMode } from "./config/ModeService";

type GuardConfig = Config & {
    onGuardInit?(): void;
};

function guessMimeType(url: string): string {
    const extension = url.split('.').pop()?.split('?')[0].toLowerCase();

    if (!extension) {
        return 'application/octet-stream';
    }

    return {
        js: 'text/javascript',
        css: 'text/css',
        html: 'text/html',
        json: 'application/json',
        png: 'image/png',
        jpg: 'image/jpeg',
        jpeg: 'image/jpeg',
        gif: 'image/gif',
        svg: 'image/svg+xml',
        ico: 'image/x-icon',
        wasm: 'application/wasm',
    }[extension] || 'application/octet-stream';
}

export function cspConsoleWebGuard({ onGuardInit, policies, mode, reportUri }: GuardConfig): void {
    initConfig({ policies, mode, reportUri });

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
                    contentType: event.data?.contentType ?? guessMimeType(event.data?.url)
                };
                console.log('[SW Asset Fetched]', normalizedData);
            }
        });
    }
}
