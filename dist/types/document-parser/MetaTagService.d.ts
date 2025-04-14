export declare function getMetaTag(html: Document): HTMLMetaElement | null;
export declare function getCspValueFromMetaTag(html: Document): string | undefined;
export declare function updateCspMetaTagInDocument(html: Document, cspDirective: string): Document;
