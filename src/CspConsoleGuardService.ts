import { Config, initConfig } from "./config/ConfigService";
import { cspWebGuard } from "./guard/GuardService";

type GuardConfig = Config & {
    onGuardInit?(): void;
};

export function cspConsoleWebGuard({ onGuardInit, policies, mode, reportUri }: GuardConfig): void {
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
