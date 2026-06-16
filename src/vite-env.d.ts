/// <reference types="vite/client" />

interface ImportMetaEnv {
    /** Canonical site origin, e.g. https://manager.mosona.cc (no trailing slash) */
    readonly VITE_SITE_URL?: string;
}

interface ImportMeta {
    readonly env: ImportMetaEnv;
}

declare module '*.md?raw' {
    const content: string;
    export default content;
}

declare module '*.yaml?raw' {
    const content: string;
    export default content;
}
