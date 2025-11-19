import { SignatureState } from '@/lib/types';

export interface PathData {
  d: string;
  len: number;
  index: number;
}

export function getTextureDefs(type: string, color: string, size: number, opacity: number, thickness: number = 1): string {
  const s = size * 10; // Scale size for better visibility
  const c = color;
  const o = opacity;
  const t = thickness;

  if (type === 'grid') {
    return `
      <pattern id="texture-grid" x="0" y="0" width="${s}" height="${s}" patternUnits="userSpaceOnUse">
        <path d="M ${s} 0 L 0 0 0 ${s}" fill="none" stroke="${c}" stroke-width="${t}" stroke-opacity="${o}"/>
      </pattern>
    `;
  }
  if (type === 'dots') {
    return `
      <pattern id="texture-dots" x="0" y="0" width="${s}" height="${s}" patternUnits="userSpaceOnUse">
        <circle cx="${s/2}" cy="${s/2}" r="${t}" fill="${c}" fill-opacity="${o}"/>
      </pattern>
    `;
  }
  if (type === 'lines') {
    return `
      <pattern id="texture-lines" x="0" y="0" width="${s}" height="${s}" patternUnits="userSpaceOnUse">
        <path d="M 0 ${s/2} L ${s} ${s/2}" stroke="${c}" stroke-width="${t}" stroke-opacity="${o}"/>
      </pattern>
    `;
  }
  if (type === 'cross') {
    return `
      <pattern id="texture-cross" x="0" y="0" width="${s}" height="${s}" patternUnits="userSpaceOnUse">
        <path d="M ${s/4} ${s/4} L ${s*0.75} ${s*0.75} M ${s*0.75} ${s/4} L ${s/4} ${s*0.75}" stroke="${c}" stroke-width="${t}" stroke-opacity="${o}"/>
      </pattern>
    `;
  }
  return '';
}

export function generateSVG(state: SignatureState, paths: PathData[], viewBox: { x: number, y: number, w: number, h: number }): string {
  const width = viewBox.w;
  const height = viewBox.h;
  const padding = 20;
  
  // Calculate total duration for animation
  const totalLength = paths.reduce((acc, p) => acc + p.len, 0);
  const speed = state.speed || 0.5; // pixels per ms roughly, or just a factor
  
  // Generate Defs
  let defs = '';
  
  // Gradients
  if (state.fillMode === 'gradient') {
    defs += `
      <linearGradient id="grad-fill" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" stop-color="${state.fill1}" />
        <stop offset="100%" stop-color="${state.fill2}" />
      </linearGradient>
    `;
  }

  // Filters
  if (state.useGlow) {
    defs += `
      <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
        <feGaussianBlur stdDeviation="2.5" result="coloredBlur"/>
        <feMerge>
          <feMergeNode in="coloredBlur"/>
          <feMergeNode in="SourceGraphic"/>
        </feMerge>
      </filter>
    `;
  }
  
  if (state.useShadow) {
    defs += `
      <filter id="shadow" x="-50%" y="-50%" width="200%" height="200%">
        <feDropShadow dx="2" dy="2" stdDeviation="3" flood-opacity="0.3"/>
      </filter>
    `;
  }

  // Textures
  if (state.texture && state.texture !== 'none') {
    defs += getTextureDefs(state.texture, state.texColor, state.texSize, state.texOpacity, state.texThickness);
  }

  // Build Paths
  let pathElements = '';
  let currentDelay = 0;

  paths.forEach((p, i) => {
    const duration = (p.len / 500) / speed; // heuristic duration
    const delay = currentDelay;
    currentDelay += duration;

    const fill = state.fillMode === 'single' ? state.fill1 : 
                 state.fillMode === 'gradient' ? 'url(#grad-fill)' : 
                 (state.charColors[i] || state.fill1);
    
    const stroke = state.strokeEnabled ? state.stroke : 'none';
    const filter = [state.useGlow ? 'url(#glow)' : '', state.useShadow ? 'url(#shadow)' : ''].filter(Boolean).join(' ');

    // Animation CSS
    const animId = `anim-${i}`;
    const style = `
      #${animId} {
        stroke-dasharray: ${p.len};
        stroke-dashoffset: ${p.len};
        animation: draw ${duration}s linear forwards ${delay}s, fill-fade 0.5s ease-out forwards ${delay + duration}s;
      }
    `;
    
    // We inject style tag for each path to keep it self-contained or use a global style block
    // For simplicity in this string builder, we'll use a global style block at the end, but here we just need attributes.
    // Actually, inline styles for animation are tricky in pure SVG string if we want it to be portable. 
    // Best is to put a <style> block in defs.
    
    pathElements += `
      <path 
        id="path-${i}"
        d="${p.d}" 
        fill="${fill}" 
        stroke="${stroke}" 
        stroke-width="2" 
        stroke-linecap="round" 
        stroke-linejoin="round"
        filter="${filter}"
        style="stroke-dasharray: ${p.len}; stroke-dashoffset: ${p.len}; opacity: 0; animation: draw ${duration}s linear forwards ${delay}s, fade-in 0.1s linear forwards ${delay}s;"
      />
    `;
  });

  // Texture Overlay
  let textureOverlay = '';
  if (state.texture && state.texture !== 'none') {
    textureOverlay = `<rect x="${viewBox.x}" y="${viewBox.y}" width="${width}" height="${height}" fill="url(#texture-${state.texture})" pointer-events="none"/>`;
  }

  // Global Styles
  const css = `
    @keyframes draw {
      to { stroke-dashoffset: 0; }
    }
    @keyframes fade-in {
      to { opacity: 1; }
    }
    path {
      fill-opacity: 0;
      animation-fill-mode: forwards;
    }
    /* We need a separate animation for fill-opacity if we want it to fade in after drawing */
    /* But standard CSS animation on 'fill-opacity' works */
    path {
      animation-name: draw, fill-fade;
      /* duration and delay are set inline */
    }
    @keyframes fill-fade {
      from { fill-opacity: 0; }
      to { fill-opacity: 1; }
    }
  `;

  // Fix animation logic: 
  // The inline style above sets `animation: draw ...` which overrides the class rule.
  // We need to be careful. Let's just use the inline style for everything specific.
  
  // Re-loop to generate correct inline styles with fill-fade
  pathElements = '';
  currentDelay = 0;
  paths.forEach((p, i) => {
    const duration = (p.len / 300) / speed; // Adjusted speed divisor
    const delay = currentDelay;
    currentDelay += duration * 0.8; // Overlap slightly

    const fill = state.fillMode === 'single' ? state.fill1 : 
                 state.fillMode === 'gradient' ? 'url(#grad-fill)' : 
                 (state.charColors[i] || state.fill1);
    
    const stroke = state.strokeEnabled ? state.stroke : 'none';
    const filter = [state.useGlow ? 'url(#glow)' : '', state.useShadow ? 'url(#shadow)' : ''].filter(Boolean).join(' ');

    pathElements += `
      <path 
        d="${p.d}" 
        fill="${fill}" 
        stroke="${stroke}" 
        stroke-width="2" 
        stroke-linecap="round" 
        stroke-linejoin="round"
        filter="${filter}"
        style="
          stroke-dasharray: ${p.len}; 
          stroke-dashoffset: ${p.len}; 
          fill-opacity: 0;
          animation: 
            draw ${duration}s ease-out forwards ${delay}s, 
            fill-fade 0.8s ease-out forwards ${delay + duration * 0.6}s;
        "
      />
    `;
  });

  return `
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      viewBox="${viewBox.x} ${viewBox.y} ${width} ${height}"
      style="background-color: ${state.bgTransparent ? 'transparent' : state.bg}; border-radius: ${state.borderRadius}px;"
    >
      <defs>
        ${defs}
        <style>
          @keyframes draw { to { stroke-dashoffset: 0; } }
          @keyframes fill-fade { to { fill-opacity: 1; } }
        </style>
      </defs>
      ${textureOverlay}
      <g>${pathElements}</g>
    </svg>
  `;
}
