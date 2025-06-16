import { CspDirective } from "../directives/DirectiveService";

type MimeTypeToDirectivesMap = {
    [mimeType: string]: CspDirective[];
};

export function guessMimeTypeFromUrl(url: string): string {
    const extension = url.split('.').pop()?.split('?')[0].toLowerCase();

    if (!extension) {
        return 'application/octet-stream';
    }

    return {
        js: 'text/javascript',
        css: 'text/css',
        html: 'text/html',
        json: 'application/json',
        png: 'image/png',
        jpg: 'image/jpeg',
        jpeg: 'image/jpeg',
        gif: 'image/gif',
        svg: 'image/svg+xml',
        ico: 'image/x-icon',
        wasm: 'application/wasm',
    }[extension] || 'application/octet-stream';
}

export function getCspDirectivesForMimeType(mimeType: string): CspDirective[] {
    const mimeToDirectives: MimeTypeToDirectivesMap = {
        // Scripts
        'application/javascript': ['script-src', 'script-src-elem', 'script-src-attr'],
        'application/x-javascript': ['script-src', 'script-src-elem', 'script-src-attr'],
        'text/javascript': ['script-src', 'script-src-elem', 'script-src-attr'],
        'application/ecmascript': ['script-src', 'script-src-elem', 'script-src-attr'],
        'text/ecmascript': ['script-src', 'script-src-elem', 'script-src-attr'],

        // Stylesheets
        'text/css': ['style-src', 'style-src-elem', 'style-src-attr'],

        // Images
        'image/png': ['img-src'],
        'image/jpeg': ['img-src'],
        'image/jpg': ['img-src'],
        'image/gif': ['img-src'],
        'image/webp': ['img-src'],
        'image/svg+xml': ['img-src'],
        'image/x-icon': ['img-src'],

        // Fonts
        'font/woff': ['font-src'],
        'font/woff2': ['font-src'],
        'application/font-woff': ['font-src'],
        'application/font-woff2': ['font-src'],
        'application/vnd.ms-fontobject': ['font-src'],
        'font/ttf': ['font-src'],
        'font/otf': ['font-src'],

        // Media
        'audio/mpeg': ['media-src'],
        'audio/ogg': ['media-src'],
        'audio/wav': ['media-src'],
        'video/mp4': ['media-src'],
        'video/webm': ['media-src'],
        'video/ogg': ['media-src'],

        // HTML documents
        'text/html': ['frame-src', 'child-src', 'default-src'],

        // JSON / data APIs
        'application/json': ['connect-src', 'default-src'],
        'application/xml': ['connect-src', 'default-src'],
        'text/xml': ['connect-src', 'default-src'],

        // WebAssembly
        'application/wasm': ['script-src'],

        // Others
        'application/pdf': ['object-src'],
        'application/octet-stream': ['object-src'],
    };

    return mimeToDirectives[mimeType] || [];
}
