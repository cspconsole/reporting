export interface MD5hasher {
    (content: string): string;
}

export const getMD5hash: MD5hasher = (content: string)=> {
    return content;
};
