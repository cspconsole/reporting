type GuardConfig = {
    onGuardInit(): void
};

export function cspConsoleWebGuard({ onGuardInit }: GuardConfig): void {
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('./service-worker.js')
            .then(() => {
                onGuardInit();
            }).catch((error) => {
            console.log('Service Worker registration failed:', error);
        });
    }
}
