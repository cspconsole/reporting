export function getMetaTag(html: Document): HTMLMetaElement | null {
    return html.querySelector('meta[http-equiv="content-security-policy"]');
}

export function getCspValueFromMetaTag(html: Document): string | undefined {
    const meta = getMetaTag(html);

    return meta?.content;
}

export function updateCspMetaTagInDocument(html: Document, cspDirective: string): Document {
    const metaTag = getMetaTag(html);

    if (!metaTag) {
        const meta = html.createElement('meta');
        meta.setAttribute('http-equiv', 'content-security-policy');
        meta.setAttribute('content', cspDirective);
        
        html.head.appendChild(meta);

        return html;
    }

    metaTag?.setAttribute('content', cspDirective);

    return html;
}
