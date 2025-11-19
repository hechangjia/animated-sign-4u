import React from "react";
import { SignatureState } from "@/lib/types";
import { ContentFontSection } from "./sidebar-content-section";
import { ParamsSection } from "./sidebar-params-section";
import { ThemesSection } from "./sidebar-themes-section";
import { StyleColorSection } from "./sidebar-style-section";

interface SidebarProps {
  state: SignatureState;
  updateState: (updates: Partial<SignatureState>) => void;
  onFontUpload: (file: File) => void;
}

export function Sidebar({ state, updateState, onFontUpload }: SidebarProps) {
  return (
    <aside className="w-full md:w-80 lg:w-96 bg-card border-r h-full overflow-y-auto flex flex-col z-10 shrink-0 shadow-sm">
      <div className="p-4 space-y-6 pb-10">
        <ContentFontSection
          state={state}
          updateState={updateState}
          onFontUpload={onFontUpload}
        />

        <hr className="border-border" />

        <ParamsSection state={state} updateState={updateState} />

        <ThemesSection state={state} updateState={updateState} />

        <StyleColorSection state={state} updateState={updateState} />

        <hr className="border-border" />
      </div>
    </aside>
  );
}
