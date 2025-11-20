import { describe, expect, it } from "vitest";
import { buildStateFromQuery } from "@/app/api/sign/route";
import { INITIAL_STATE } from "@/lib/constants";

describe("buildStateFromQuery", () => {
    it("applies theme and query overrides", () => {
        const params = new URLSearchParams({
            theme: "laser",
            text: "Hello",
            font: "lobster",
            fill: "gradient",
            bg: "000000",
            texture: "grid",
        });

        const state = buildStateFromQuery(params);

        expect(state.text).toBe("Hello");
        expect(state.font).toBe("lobster");
        expect(state.fillMode).toBe("gradient");
        expect(state.bgTransparent).toBe(false);
        expect(state.bg).toBe("#000000");
        expect(state.texture).toBe("grid");
        // Should at least carry over some theme defaults
        expect(state.stroke).toBeDefined();
    });

    it("falls back to INITIAL_STATE when no params", () => {
        const params = new URLSearchParams();
        const state = buildStateFromQuery(params);

        expect(state.text).toBe(INITIAL_STATE.text);
        expect(state.font).toBe(INITIAL_STATE.font);
    });

    it("populates charColors when fill=multi and no explicit colors", () => {
        const params = new URLSearchParams({
            text: "MultiTest",
            fill: "multi",
        });

        const state = buildStateFromQuery(params);

        expect(state.fillMode).toBe("multi");
        expect(state.charColors.length).toBe(state.text.length);
    });

    it("uses colors param to set charColors and multi fillMode", () => {
        const params = new URLSearchParams({
            text: "AB",
            colors: "ff0000-00ff00",
        });

        const state = buildStateFromQuery(params);

        expect(state.fillMode).toBe("multi");
        expect(state.charColors[0]).toBe("#ff0000");
        expect(state.charColors[1]).toBe("#00ff00");
    });

    it("parses background size parameters", () => {
        const params = new URLSearchParams({
            bgSizeMode: "custom",
            bgWidth: "800",
            bgHeight: "400",
        });

        const state = buildStateFromQuery(params);

        expect(state.bgSizeMode).toBe("custom");
        expect(state.bgWidth).toBe(800);
        expect(state.bgHeight).toBe(400);
    });

    it("parses core style and color parameters", () => {
        const params = new URLSearchParams({
            text: "Signature",
            font: "sacramento",
            fontSize: "39",
            speed: "1.25",
            charSpacing: "10",
            borderRadius: "32",
            cardPadding: "16",
            fill1: "ff0000",
            fill2: "00ff00",
            stroke: "0000ff",
            stroke2: "333333",
            strokeMode: "gradient",
            strokeEnabled: "1",
            bg: "1e3a8a",
            bgMode: "gradient",
            bg2: "0f172a",
            texture: "grid",
            texColor: "ffffff",
            texSize: "42",
            texThickness: "2",
            texOpacity: "0.7",
            useGlow: "1",
            useShadow: "0",
        });

        const state = buildStateFromQuery(params);

        expect(state.text).toBe("Signature");
        expect(state.font).toBe("sacramento");
        expect(state.fontSize).toBe(39);
        expect(state.speed).toBe(1.25);
        expect(state.charSpacing).toBe(10);
        expect(state.borderRadius).toBe(32);
        expect(state.cardPadding).toBe(16);

        expect(state.fill1).toBe("#ff0000");
        expect(state.fill2).toBe("#00ff00");
        expect(state.stroke).toBe("#0000ff");
        expect(state.stroke2).toBe("#333333");
        expect(state.strokeMode).toBe("gradient");
        expect(state.strokeEnabled).toBe(true);

        expect(state.bgTransparent).toBe(false);
        expect(state.bg).toBe("#1e3a8a");
        expect(state.bgMode).toBe("gradient");
        expect(state.bg2).toBe("#0f172a");

        expect(state.texture).toBe("grid");
        expect(state.texColor).toBe("#ffffff");
        expect(state.texSize).toBe(42);
        expect(state.texThickness).toBe(2);
        expect(state.texOpacity).toBe(0.7);

        expect(state.useGlow).toBe(true);
        expect(state.useShadow).toBe(false);
    });
});
