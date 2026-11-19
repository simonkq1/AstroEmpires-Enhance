import { useStyle as upstreamUseStyle } from '@primevue/core/usestyle';

type StyleOptions = NonNullable<Parameters<typeof upstreamUseStyle>[1]>;
let styleRoot: ShadowRoot | undefined;

export function setPrimeVueStyleRoot(root: ShadowRoot): void {
    styleRoot = root;
}

export function useStyle(css: string, options?: StyleOptions) {
    const root = styleRoot;
    // PrimeVue 4.5.5 只使用這四個成員，null 會停用掛載。
    const document = root ? {
        head: root,
        querySelector: root.querySelector.bind(root),
        getElementById: root.getElementById.bind(root),
        createElement: root.ownerDocument.createElement.bind(root.ownerDocument),
    } : null;
    return upstreamUseStyle(css, { ...options, document: document as unknown as StyleOptions['document'] });
}
