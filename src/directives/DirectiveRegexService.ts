export function normalizeCspDirectiveValue(value:string): string {
    return value.replace('*', '[^\.]+');
}

export function isUrlAllowedByDirectiveValue(value: string, url: string): boolean {
    return new RegExp('^' + value).test(url);
}
