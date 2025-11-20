export type Locale = "en" | "zh";

export const messages = {
    en: {
        appTitle: "Animated Signature 4u",
        exportComponent: "Export Component",
        reactComponent: "React Component",
        vueComponent: "Vue Component",
        jsComponent: "HTML / JS",
        svgButton: "SVG",
        apiAndCode: "API & Code",
    },
    zh: {
        appTitle: "动态签名 4u",
        exportComponent: "导出组件",
        reactComponent: "React 组件",
        vueComponent: "Vue 组件",
        jsComponent: "HTML / JS",
        svgButton: "SVG 图像",
        apiAndCode: "API 与代码",
    },
} as const;

export type MessageKey = keyof typeof messages.en;

export function translate(locale: Locale, key: MessageKey): string {
    const table = messages[locale] ?? messages.en;
    return table[key] ?? messages.en[key];
}
