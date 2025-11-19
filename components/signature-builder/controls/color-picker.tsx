import React from 'react';
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

interface ColorPickerProps {
  label?: string;
  value: string;
  onChange: (value: string) => void;
  className?: string;
}

export function ColorPicker({ label, value, onChange, className }: ColorPickerProps) {
  return (
    <div className={className}>
      {label && <Label className="text-xs text-muted-foreground mb-1.5 block">{label}</Label>}
      <div className="flex items-center gap-3">
        <div className="relative w-8 h-8 rounded-full overflow-hidden ring-1 ring-border shadow-sm hover:scale-105 transition-transform">
          <input 
            type="color" 
            value={value} 
            onChange={(e) => onChange(e.target.value)}
            className="absolute -top-2 -left-2 w-12 h-12 cursor-pointer p-0 border-0" 
          />
        </div>
        <span className="text-xs font-mono text-muted-foreground bg-muted px-2 py-1 rounded select-all">
          {value}
        </span>
      </div>
    </div>
  );
}
