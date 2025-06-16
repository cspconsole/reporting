export interface MD5hasher {
    (content: string): string;
}
export declare const getMD5hash: MD5hasher;
