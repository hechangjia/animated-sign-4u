import React from 'react';
import { SignatureState, TextureType, FillMode } from '@/lib/types';
import { FONTS, THEMES, DEFAULT_CHAR_COLORS } from '@/lib/constants';
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { ColorPicker } from './controls/color-picker';
import { PenTool, Palette, Wand2, Settings2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SidebarProps {
  state: SignatureState;
  updateState: (updates: Partial<SignatureState>) => void;
  onFontUpload: (file: File) => void;
}

export function Sidebar({ state, updateState, onFontUpload }: SidebarProps) {
  
  const applyTheme = (themeName: string) => {
    const theme = THEMES[themeName];
    if (!theme) return;
    
    const updates: Partial<SignatureState> = { ...theme };
    
    if (theme.isRainbow) {
      const len = state.text.length;
      updates.charColors = Array.from({length: len}, (_, i) => DEFAULT_CHAR_COLORS[i % DEFAULT_CHAR_COLORS.length]);
    }
    
    updateState(updates);
  };

  const updateCharColor = (index: number, color: string) => {
    const newColors = [...state.charColors];
    newColors[index] = color;
    updateState({ charColors: newColors });
  };

  return (
    <aside className="w-full md:w-80 lg:w-96 bg-card border-r h-full overflow-y-auto flex flex-col z-10 shrink-0 shadow-sm">
      <div className="p-6 space-y-8 pb-20">
        
        {/* Section 1: Content & Font */}
        <section className="space-y-4">
          <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
            <span className="w-6 h-6 rounded bg-indigo-100 text-indigo-600 flex items-center justify-center">
              <PenTool className="w-3 h-3" />
            </span>
            Content & Font
          </h3>
          
          <div className="space-y-4">
            <div>
              <Label className="text-xs text-muted-foreground mb-1.5 block">Signature Text</Label>
              <Input 
                value={state.text} 
                onChange={(e) => updateState({ text: e.target.value })}
                placeholder="Enter text..."
                className="font-medium"
              />
            </div>

            <div>
              <Label className="text-xs text-muted-foreground mb-1.5 block">Font Family</Label>
              <Select value={state.font} onValueChange={(val) => val === 'custom' ? document.getElementById('font-upload')?.click() : updateState({ font: val })}>
                <SelectTrigger className="bg-background">
                  <SelectValue placeholder="Select font" />
                </SelectTrigger>
                <SelectContent className="bg-popover border-2 border-border shadow-xl max-h-[300px] overflow-y-auto">
                  <SelectGroup>
                    <SelectLabel>✨ Script</SelectLabel>
                    {FONTS.filter(f => f.category.includes('Script')).map(f => (
                      <SelectItem key={f.value} value={f.value} className="bg-popover hover:bg-accent">{f.label}</SelectItem>
                    ))}
                  </SelectGroup>
                  <SelectGroup>
                    <SelectLabel>🔥 Brand</SelectLabel>
                    {FONTS.filter(f => f.category.includes('Brand')).map(f => (
                      <SelectItem key={f.value} value={f.value} className="bg-popover hover:bg-accent">{f.label}</SelectItem>
                    ))}
                  </SelectGroup>
                  <SelectGroup>
                    <SelectLabel>🧧 Local</SelectLabel>
                    {FONTS.filter(f => f.category.includes('Local')).map(f => (
                      <SelectItem key={f.value} value={f.value} className="bg-popover hover:bg-accent">{f.label}</SelectItem>
                    ))}
                  </SelectGroup>
                  <SelectGroup>
                    <SelectLabel>📂 Custom</SelectLabel>
                    <SelectItem value="custom" className="bg-popover hover:bg-accent">Upload Font...</SelectItem>
                  </SelectGroup>
                </SelectContent>
              </Select>
              <input 
                type="file" 
                id="font-upload" 
                className="hidden" 
                accept=".ttf,.otf,.woff"
                onChange={(e) => e.target.files?.[0] && onFontUpload(e.target.files[0])}
              />
            </div>
          </div>
        </section>

        <hr className="border-border" />

        {/* Section 2: Style & Color */}
        <section className="space-y-4">
          <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
            <span className="w-6 h-6 rounded bg-pink-100 text-pink-600 flex items-center justify-center">
              <Palette className="w-3 h-3" />
            </span>
            Style & Color
          </h3>

          {/* Background Card */}
          <div className="p-3 bg-card border rounded-xl shadow-sm space-y-4">
            <div className="flex justify-between items-center">
              <Label className="text-xs font-semibold">Card Background</Label>
              <div className="flex items-center gap-2">
                <Switch 
                  checked={state.bgTransparent} 
                  onCheckedChange={(c) => updateState({ bgTransparent: c })} 
                  id="bg-transparent"
                />
                <Label htmlFor="bg-transparent" className="text-xs text-muted-foreground">Transparent</Label>
              </div>
            </div>

            <div className={cn("transition-opacity duration-200", state.bgTransparent && "opacity-50 pointer-events-none")}>
              <ColorPicker value={state.bg} onChange={(c) => updateState({ bg: c })} />
            </div>

            <div className="pt-3 border-t">
              <Label className="text-xs text-muted-foreground mb-2 block">Texture</Label>
              <Select value={state.texture} onValueChange={(v) => updateState({ texture: v as TextureType })}>
                <SelectTrigger className="h-8 text-xs bg-background">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-popover border-2 border-border shadow-xl">
                  <SelectItem value="none" className="bg-popover hover:bg-accent">None</SelectItem>
                  <SelectItem value="grid" className="bg-popover hover:bg-accent">Grid</SelectItem>
                  <SelectItem value="dots" className="bg-popover hover:bg-accent">Dots</SelectItem>
                  <SelectItem value="lines" className="bg-popover hover:bg-accent">Lines</SelectItem>
                  <SelectItem value="cross" className="bg-popover hover:bg-accent">Cross</SelectItem>
                </SelectContent>
              </Select>

              {state.texture !== 'none' && (
                <div className="mt-3 space-y-3 pl-1 animate-in slide-in-from-top-2 fade-in duration-200">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] text-muted-foreground">Color</span>
                    <input type="color" value={state.texColor} onChange={(e) => updateState({ texColor: e.target.value })} className="w-5 h-5 rounded cursor-pointer border-0 p-0" />
                  </div>
                  <div className="space-y-1">
                    <div className="flex justify-between text-[10px] text-muted-foreground"><span>Size</span><span>{state.texSize}</span></div>
                    <Slider min={10} max={100} value={[state.texSize]} onValueChange={([v]) => updateState({ texSize: v })} className="[&_[data-slot=slider-track]]:bg-slate-200 [&_[data-slot=slider-track]]:h-2 [&_[data-slot=slider-range]]:bg-indigo-500 [&_[data-slot=slider-thumb]]:bg-white [&_[data-slot=slider-thumb]]:border-2 [&_[data-slot=slider-thumb]]:border-indigo-500 [&_[data-slot=slider-thumb]]:shadow-lg [&_[data-slot=slider-thumb]]:w-5 [&_[data-slot=slider-thumb]]:h-5" />
                  </div>
                  <div className="space-y-1">
                    <div className="flex justify-between text-[10px] text-muted-foreground"><span>Thickness</span><span>{state.texThickness}</span></div>
                    <Slider min={0.5} max={5} step={0.5} value={[state.texThickness]} onValueChange={([v]) => updateState({ texThickness: v })} className="[&_[data-slot=slider-track]]:bg-slate-200 [&_[data-slot=slider-track]]:h-2 [&_[data-slot=slider-range]]:bg-indigo-500 [&_[data-slot=slider-thumb]]:bg-white [&_[data-slot=slider-thumb]]:border-2 [&_[data-slot=slider-thumb]]:border-indigo-500 [&_[data-slot=slider-thumb]]:shadow-lg [&_[data-slot=slider-thumb]]:w-5 [&_[data-slot=slider-thumb]]:h-5" />
                  </div>
                  <div className="space-y-1">
                    <div className="flex justify-between text-[10px] text-muted-foreground"><span>Opacity</span><span>{state.texOpacity}</span></div>
                    <Slider min={0.1} max={1} step={0.1} value={[state.texOpacity]} onValueChange={([v]) => updateState({ texOpacity: v })} className="[&_[data-slot=slider-track]]:bg-slate-200 [&_[data-slot=slider-track]]:h-2 [&_[data-slot=slider-range]]:bg-indigo-500 [&_[data-slot=slider-thumb]]:bg-white [&_[data-slot=slider-thumb]]:border-2 [&_[data-slot=slider-thumb]]:border-indigo-500 [&_[data-slot=slider-thumb]]:shadow-lg [&_[data-slot=slider-thumb]]:w-5 [&_[data-slot=slider-thumb]]:h-5" />
                  </div>
                </div>
              )}
            </div>

            <div className="pt-3 border-t space-y-2">
              <div className="flex justify-between text-xs">
                <span className="text-muted-foreground">Corner Radius</span>
                <span className="font-mono text-indigo-600">{state.borderRadius}px</span>
              </div>
              <Slider min={0} max={40} value={[state.borderRadius]} onValueChange={([v]) => updateState({ borderRadius: v })} className="[&_[data-slot=slider-track]]:bg-slate-200 [&_[data-slot=slider-track]]:h-2 [&_[data-slot=slider-range]]:bg-indigo-500 [&_[data-slot=slider-thumb]]:bg-white [&_[data-slot=slider-thumb]]:border-2 [&_[data-slot=slider-thumb]]:border-indigo-500 [&_[data-slot=slider-thumb]]:shadow-lg [&_[data-slot=slider-thumb]]:w-5 [&_[data-slot=slider-thumb]]:h-5" />
            </div>
          </div>

          {/* Stroke */}
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <Label className="text-xs font-medium text-muted-foreground">Stroke Color</Label>
              <div className="flex items-center gap-2">
                <Switch checked={state.strokeEnabled} onCheckedChange={(c) => updateState({ strokeEnabled: c })} id="stroke-enable" />
                <Label htmlFor="stroke-enable" className="text-[10px] text-muted-foreground">Enable</Label>
              </div>
            </div>
            <div className={cn("transition-opacity", !state.strokeEnabled && "opacity-50")}>
              <ColorPicker value={state.stroke} onChange={(c) => updateState({ stroke: c })} />
            </div>
          </div>

          {/* Fill */}
          <div className="space-y-3">
            <Label className="text-xs font-medium text-muted-foreground">Fill Mode</Label>
            <div className="flex bg-muted p-1 rounded-lg">
              {(['single', 'gradient', 'multi'] as const).map((mode) => (
                <button
                  key={mode}
                  onClick={() => updateState({ fillMode: mode })}
                  className={cn(
                    "flex-1 py-1.5 text-xs font-medium rounded-md transition-all capitalize",
                    state.fillMode === mode ? "bg-background shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  {mode}
                </button>
              ))}
            </div>

            {state.fillMode === 'single' && (
              <ColorPicker value={state.fill1} onChange={(c) => updateState({ fill1: c })} />
            )}

            {state.fillMode === 'gradient' && (
              <div className="flex gap-2 items-center">
                <div className="flex-1"><ColorPicker value={state.fill1} onChange={(c) => updateState({ fill1: c })} /></div>
                <span className="text-muted-foreground">→</span>
                <div className="flex-1"><ColorPicker value={state.fill2} onChange={(c) => updateState({ fill2: c })} /></div>
              </div>
            )}

            {state.fillMode === 'multi' && (
              <div className="bg-muted/30 border rounded-lg p-2 overflow-x-auto">
                <div className="flex gap-2 min-w-max pb-1">
                  {state.text.split('').map((char, idx) => (
                    <div key={idx} className="flex flex-col items-center min-w-[24px] gap-1">
                      <span className="text-[10px] text-muted-foreground font-mono">{char}</span>
                      <input 
                        type="color" 
                        value={state.charColors[idx] || state.fill1} 
                        onChange={(e) => updateCharColor(idx, e.target.value)}
                        className="w-6 h-6 rounded cursor-pointer border-0 p-0"
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Effects */}
          <div className="grid grid-cols-2 gap-3">
            <div 
              className={cn("cursor-pointer border p-3 rounded-xl transition hover:border-indigo-300 hover:shadow-sm", state.useGlow && "border-indigo-500 bg-indigo-50/50")}
              onClick={() => updateState({ useGlow: !state.useGlow })}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-bold">Glow</span>
                <Switch checked={state.useGlow} onCheckedChange={(c) => updateState({ useGlow: c })} />
              </div>
              <p className="text-[10px] text-muted-foreground">Neon light effect</p>
            </div>

            <div 
              className={cn("cursor-pointer border p-3 rounded-xl transition hover:border-indigo-300 hover:shadow-sm", state.useShadow && "border-indigo-500 bg-indigo-50/50")}
              onClick={() => updateState({ useShadow: !state.useShadow })}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-bold">Shadow</span>
                <Switch checked={state.useShadow} onCheckedChange={(c) => updateState({ useShadow: c })} />
              </div>
              <p className="text-[10px] text-muted-foreground">3D drop shadow</p>
            </div>
          </div>
        </section>

        {/* Section 3: Themes */}
        <section className="space-y-4">
          <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
            <span className="w-6 h-6 rounded bg-amber-100 text-amber-600 flex items-center justify-center">
              <Wand2 className="w-3 h-3" />
            </span>
            Quick Themes
          </h3>
          <div className="grid grid-cols-4 gap-2">
            {Object.keys(THEMES).map((themeKey) => {
              const theme = THEMES[themeKey];
              const isActive = 
                state.bg === theme.bg && 
                state.stroke === theme.stroke && 
                state.font === theme.font;

              return (
                <button
                  key={themeKey}
                  onClick={() => applyTheme(themeKey)}
                  className={cn(
                    "h-14 rounded-lg border transition flex flex-col items-center justify-center gap-1 text-[10px] font-bold capitalize relative overflow-hidden group",
                    isActive ? "ring-2 ring-indigo-500 border-transparent" : "hover:border-indigo-300 hover:shadow-sm"
                  )}
                  style={{ 
                    backgroundColor: theme.bg === '#ffffff' ? '#ffffff' : theme.bg,
                    color: theme.bg === '#000000' || theme.bg === '#0f172a' || theme.bg === '#1e3a8a' ? '#ffffff' : '#333333'
                  }}
                >
                  {theme.texture === 'grid' && (
                    <div className="absolute inset-0 opacity-20" style={{ 
                      backgroundImage: `linear-gradient(${theme.texColor} 1px, transparent 1px), linear-gradient(90deg, ${theme.texColor} 1px, transparent 1px)`, 
                      backgroundSize: '10px 10px' 
                    }} />
                  )}
                  {theme.texture === 'lines' && (
                    <div className="absolute inset-0 opacity-20" style={{ 
                      backgroundImage: `linear-gradient(${theme.texColor} 1px, transparent 1px)`, 
                      backgroundSize: '10px 10px' 
                    }} />
                  )}
                  {theme.texture === 'dots' && (
                    <div className="absolute inset-0 opacity-20" style={{ 
                      backgroundImage: `radial-gradient(${theme.texColor} 1px, transparent 1px)`, 
                      backgroundSize: '6px 6px' 
                    }} />
                  )}
                  
                  <div 
                    className="w-3 h-3 rounded-full border shadow-sm relative z-10" 
                    style={{ 
                      backgroundColor: theme.fillMode === 'gradient' ? theme.fill1 : (theme.isRainbow ? 'transparent' : theme.fill1),
                      backgroundImage: theme.fillMode === 'gradient' ? `linear-gradient(135deg, ${theme.fill1}, ${theme.fill2})` : (theme.isRainbow ? 'linear-gradient(135deg, #ef4444, #3b82f6)' : 'none'),
                      borderColor: theme.stroke
                    }}
                  />
                  <span className="relative z-10">{themeKey}</span>
                </button>
              );
            })}
          </div>
        </section>

        <hr className="border-border" />

        {/* Section 4: Params */}
        <section className="space-y-4">
          <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
            <span className="w-6 h-6 rounded bg-slate-100 text-slate-600 flex items-center justify-center">
              <Settings2 className="w-3 h-3" />
            </span>
            Parameters
          </h3>
          <div className="space-y-5">
            <div className="space-y-2">
              <div className="flex justify-between text-xs font-medium">
                <span className="text-muted-foreground">Font Size</span>
                <span className="text-indigo-600 font-mono">{state.fontSize}px</span>
              </div>
              <Slider min={40} max={200} value={[state.fontSize]} onValueChange={([v]) => updateState({ fontSize: v })} className="[&_[data-slot=slider-track]]:bg-slate-200 [&_[data-slot=slider-track]]:h-2 [&_[data-slot=slider-range]]:bg-indigo-500 [&_[data-slot=slider-thumb]]:bg-white [&_[data-slot=slider-thumb]]:border-2 [&_[data-slot=slider-thumb]]:border-indigo-500 [&_[data-slot=slider-thumb]]:shadow-lg [&_[data-slot=slider-thumb]]:w-5 [&_[data-slot=slider-thumb]]:h-5" />
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-xs font-medium">
                <span className="text-muted-foreground">Animation Speed</span>
                <span className="text-indigo-600 font-mono">{state.speed}s/char</span>
              </div>
              <Slider min={0.1} max={1.5} step={0.1} value={[state.speed]} onValueChange={([v]) => updateState({ speed: v })} className="[&_[data-slot=slider-track]]:bg-slate-200 [&_[data-slot=slider-track]]:h-2 [&_[data-slot=slider-range]]:bg-indigo-500 [&_[data-slot=slider-thumb]]:bg-white [&_[data-slot=slider-thumb]]:border-2 [&_[data-slot=slider-thumb]]:border-indigo-500 [&_[data-slot=slider-thumb]]:shadow-lg [&_[data-slot=slider-thumb]]:w-5 [&_[data-slot=slider-thumb]]:h-5" />
            </div>
          </div>
        </section>

      </div>
    </aside>
  );
}
