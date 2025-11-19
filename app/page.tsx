"use client"

import React, { useState } from 'react';
import { Sidebar } from '@/components/signature-builder/sidebar';
import { PreviewArea } from '@/components/signature-builder/preview-area';
import { CodePanel } from '@/components/signature-builder/code-panel';
import { INITIAL_STATE } from '@/lib/constants';
import { SignatureState } from '@/lib/types';
import { Download, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from "@/components/ui/resizable";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { generateReactComponent, generateVueComponent, generateJSComponent } from '@/lib/code-generators';

export default function SignatureBuilderPage() {
  const [state, setState] = useState<SignatureState>(INITIAL_STATE);
  const [svgCode, setSvgCode] = useState('');
  const [uploadedFont, setUploadedFont] = useState<ArrayBuffer | null>(null);

  const updateState = (updates: Partial<SignatureState>) => {
    setState(prev => ({ ...prev, ...updates }));
  };

  const handleFontUpload = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      if (e.target?.result) {
        setUploadedFont(e.target.result as ArrayBuffer);
        updateState({ font: 'custom' });
      }
    };
    reader.readAsArrayBuffer(file);
  };

  const downloadSVG = () => {
    if (!svgCode) return;
    const blob = new Blob([svgCode], { type: "image/svg+xml;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `signature_${state.text}.svg`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const downloadComponent = (type: 'react' | 'vue' | 'js') => {
    if (!svgCode) return;
    
    let code = '';
    let filename = '';
    let mimeType = '';
    
    if (type === 'react') {
      code = generateReactComponent(svgCode, state);
      filename = `Signature.tsx`;
      mimeType = 'text/typescript';
    } else if (type === 'vue') {
      code = generateVueComponent(svgCode, state);
      filename = `Signature.vue`;
      mimeType = 'text/plain';
    } else if (type === 'js') {
      code = generateJSComponent(svgCode, state);
      filename = `signature.js`;
      mimeType = 'text/javascript';
    }
    
    const blob = new Blob([code], { type: `${mimeType};charset=utf-8` });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="h-screen flex flex-col overflow-hidden bg-background font-sans">
      {/* Header */}
      <header className="h-14 border-b bg-card backdrop-blur-md flex items-center justify-between px-6 shrink-0 z-20 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-lg flex items-center justify-center text-white font-bold text-xl shadow-lg transform -rotate-3">S</div>
          <h1 className="text-sm font-bold tracking-tight hidden md:block">
            Animated Signature <span className="text-indigo-600">4u</span>
          </h1>
        </div>
        
        <div className="flex items-center gap-2">
          {/* Component Download - Split Button */}
          <div className="flex bg-indigo-600 hover:bg-indigo-700 rounded-md shadow-sm overflow-hidden">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => downloadComponent('react')}
              className="h-8 text-xs gap-2 text-white hover:bg-indigo-700 hover:text-white rounded-none border-r border-indigo-500"
            >
              <Download className="w-3.5 h-3.5" />
              Download Component
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="h-8 w-8 p-0 text-white hover:bg-indigo-700 hover:text-white rounded-none"
                >
                  <ChevronDown className="w-3.5 h-3.5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-40">
                <DropdownMenuItem onClick={() => downloadComponent('react')} className="cursor-pointer">
                  React Component
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => downloadComponent('vue')} className="cursor-pointer">
                  Vue Component
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => downloadComponent('js')} className="cursor-pointer">
                  JS Module
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          
          {/* SVG Download - Simple Button */}
          <Button variant="outline" size="sm" onClick={downloadSVG} className="h-8 text-xs gap-2">
            <Download className="w-3.5 h-3.5" />
            SVG
          </Button>
        </div>
      </header>

      {/* Main Layout */}
      <div className="flex flex-1 overflow-hidden">
        <Sidebar 
          state={state} 
          updateState={updateState} 
          onFontUpload={handleFontUpload}
        />
        
        <main className="flex-1 flex flex-col min-w-0 relative bg-background">
          <ResizablePanelGroup direction="vertical">
            <ResizablePanel defaultSize={60} minSize={30}>
              <PreviewArea 
                state={state} 
                onSvgGenerated={setSvgCode}
                uploadedFont={uploadedFont}
              />
            </ResizablePanel>
            
            <ResizableHandle className="h-1.5 bg-border hover:bg-indigo-500 active:bg-indigo-600 transition-all duration-200 relative group cursor-row-resize">
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-16 h-1 bg-muted-foreground/40 rounded-full group-hover:bg-indigo-400 group-hover:w-20 transition-all duration-200" />
            </ResizableHandle>
            
            <ResizablePanel defaultSize={40} minSize={20}>
              <CodePanel svgCode={svgCode} state={state} />
            </ResizablePanel>
          </ResizablePanelGroup>
        </main>
      </div>
    </div>
  );
}
