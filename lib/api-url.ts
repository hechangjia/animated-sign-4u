import { SignatureState } from "./types";

export interface BuildSignApiUrlOptions {
    format?: string;
    origin?: string;
}

export function buildSignApiUrl(
    state: SignatureState,
    options: BuildSignApiUrlOptions = {},
): string {
    const params = new URLSearchParams();

    params.set("text", state.text);
    params.set("font", state.font);

    if (state.fillMode !== "single") {
        params.set("fill", state.fillMode);
    }

    if (state.texture !== "none") {
        params.set("texture", state.texture);
    }

    if (state.bgTransparent) {
        params.set("bg", "transparent");
    } else if (state.bg !== "#ffffff") {
        params.set("bg", state.bg.replace("#", ""));
    }

    if (state.bgSizeMode === "custom") {
        params.set("bgSizeMode", "custom");
        if (state.bgWidth) params.set("bgWidth", String(state.bgWidth));
        if (state.bgHeight) params.set("bgHeight", String(state.bgHeight));
    }

    if (state.fillMode === "multi" && state.text) {
        const colors = state.text.split("").map((_, idx) =>
            (state.charColors[idx] || state.fill1).replace("#", "")
        );
        params.set("colors", colors.join("-"));
    }

    if (options.format) {
        params.set("format", options.format);
    }

    const origin = options.origin ??
        (typeof window !== "undefined"
            ? window.location.origin
            : "https://sign.yunique.cc");

    return `${origin}/api/sign?${params.toString()}`;
}
