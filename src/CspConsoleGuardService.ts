import { Config, initConfig } from "./config/ConfigService";
import { cspWebGuard } from "./guard/GuardService";
import { shouldUseEnforceMode } from "./config/ModeService";

type GuardConfig = Config & {
    onGuardInit?(): void;
};

export function cspConsoleWebGuard({ onGuardInit, policies, mode, reportUri }: GuardConfig): void {
    if (shouldUseEnforceMode()) {
        initConfig({ policies, mode, reportUri });
        cspWebGuard();
        onGuardInit?.();
        return;
    }

    // THIS IS QUESTIONABLE WHERE TO GO WITH IT...
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('./service-worker.js')
            .then(() => {
                initConfig({ policies, mode, reportUri });
                cspWebGuard();
                onGuardInit?.();
            }).catch((error) => {
            console.log('Service Worker registration failed:', error);
        });
    }
}
