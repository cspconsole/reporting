import { Config } from "./config/ConfigService";
type GuardConfig = Config & {
    onGuardInit?(): void;
};
export declare function cspConsoleWebGuard({ onGuardInit, policies, mode, reportUri, debug }: GuardConfig): void;
export {};
