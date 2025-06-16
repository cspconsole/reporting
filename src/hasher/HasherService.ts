import { MD5 } from 'crypto-js';
export interface MD5hasher {
    (content: string): string;
}

export const getMD5hash: MD5hasher = (content: string)=> {
    return MD5(content).toString();
};
