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

        // Sidebar section titles
        contentFontSectionTitle: "Content & Font",
        paramsSectionTitle: "Parameters",
        quickThemesSectionTitle: "Quick Themes",
        styleColorSectionTitle: "Style & Color",

        // Content & Font labels
        signatureTextLabel: "Signature Text",
        fontFamilyLabel: "Font Family",
        fontCategoryScript: "Script",
        fontCategoryBrand: "Brand",
        fontCategoryLocal: "Local",
        fontCategoryCustom: "Custom",
        uploadFontLabel: "Upload Font...",

        // Parameters labels
        fontSizeLabel: "Font Size",
        animationSpeedLabel: "Animation Speed",

        // Style & Color labels
        cardBackgroundLabel: "Card Background",
        transparentLabel: "Transparent",
        backgroundModeLabel: "Background Mode",
        textureLabel: "Texture",
        textureColorLabel: "Color",
        textureSizeLabel: "Size",
        textureThicknessLabel: "Thickness",
        textureOpacityLabel: "Opacity",
        cornerRadiusLabel: "Corner Radius",
        backgroundSizeLabel: "Background Size",
        bgWidthLabel: "Width",
        bgHeightLabel: "Height",
        strokeColorLabel: "Stroke Color",
        enableLabel: "Enable",
        fillModeLabel: "Fill Mode",
        glowTitle: "Glow",
        glowDescription: "Neon light effect",
        shadowTitle: "Shadow",
        shadowDescription: "3D drop shadow",
        multiScrollHint: "Scroll to edit all characters",

        // Mobile topbar labels
        mobileDownloadLabel: "Download",
        mobileCodeLabel: "Code",
    },
    zh: {
        appTitle: "动态签名 4u",
        exportComponent: "导出组件",
        reactComponent: "React 组件",
        vueComponent: "Vue 组件",
        jsComponent: "HTML / JS",
        svgButton: "SVG 图像",
        apiAndCode: "API 与代码",

        // Sidebar section titles
        contentFontSectionTitle: "内容与字体",
        paramsSectionTitle: "参数",
        quickThemesSectionTitle: "快捷主题",
        styleColorSectionTitle: "样式与颜色",

        // Content & Font labels
        signatureTextLabel: "签名文本",
        fontFamilyLabel: "字体",
        fontCategoryScript: "连笔体",
        fontCategoryBrand: "品牌",
        fontCategoryLocal: "本地",
        fontCategoryCustom: "自定义",
        uploadFontLabel: "上传字体...",

        // Parameters labels
        fontSizeLabel: "字体大小",
        animationSpeedLabel: "动画速度",

        // Style & Color labels
        cardBackgroundLabel: "卡片背景",
        transparentLabel: "透明",
        backgroundModeLabel: "背景模式",
        textureLabel: "纹理",
        textureColorLabel: "颜色",
        textureSizeLabel: "纹理尺寸",
        textureThicknessLabel: "线条粗细",
        textureOpacityLabel: "不透明度",
        cornerRadiusLabel: "圆角",
        backgroundSizeLabel: "背景尺寸",
        bgWidthLabel: "宽度",
        bgHeightLabel: "高度",
        strokeColorLabel: "描边颜色",
        enableLabel: "启用",
        fillModeLabel: "填充模式",
        glowTitle: "发光",
        glowDescription: "霓虹灯效果",
        shadowTitle: "阴影",
        shadowDescription: "3D 投影",
        multiScrollHint: "左右滚动编辑全部字符",

        // Mobile topbar labels
        mobileDownloadLabel: "下载",
        mobileCodeLabel: "代码",
    },
} as const;

export type MessageKey = keyof typeof messages.en;

export function translate(locale: Locale, key: MessageKey): string {
    const table = messages[locale] ?? messages.en;
    return table[key] ?? messages.en[key];
}
