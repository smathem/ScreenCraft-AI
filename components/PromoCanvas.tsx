import React, { useRef, useEffect, useState } from 'react';
import { PromoConfig } from '../types';

interface PromoCanvasProps {
  config: PromoConfig;
  image: HTMLImageElement | null;
  onCanvasReady: (canvas: HTMLCanvasElement | null) => void;
  onChange: (newConfig: PromoConfig) => void;
}

type DragTarget = 'image' | 'title' | 'subtitle' | null;

interface BoundingBox {
  x: number;
  y: number;
  w: number;
  h: number;
}

const PromoCanvas: React.FC<PromoCanvasProps> = ({ config, image, onCanvasReady, onChange }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [scaleFactor, setScaleFactor] = useState(1);
  
  // Interaction State
  const [hoverTarget, setHoverTarget] = useState<DragTarget>(null);
  const [isDragging, setIsDragging] = useState(false);
  const dragStartRef = useRef<{ x: number, y: number } | null>(null);
  const initialOffsetRef = useRef<{ x: number, y: number } | null>(null);
  
  // Text Editing State
  const [editingTarget, setEditingTarget] = useState<'title' | 'subtitle' | null>(null);
  const [editText, setEditText] = useState('');

  // Store bounds of drawn elements for hit testing
  const boundsRef = useRef<Record<string, BoundingBox>>({});

  // Handle responsive resizing of the preview canvas
  useEffect(() => {
    const handleResize = () => {
      if (containerRef.current) {
        const { clientWidth, clientHeight } = containerRef.current;
        const padding = 64; 
        const availableW = clientWidth - padding;
        const availableH = clientHeight - padding;

        const availableRatio = availableW / availableH;
        const targetRatio = config.width / config.height;

        let newScale = 1;
        if (availableRatio > targetRatio) {
          newScale = availableH / config.height;
        } else {
          newScale = availableW / config.width;
        }
        setScaleFactor(Math.min(newScale, 1)); 
      }
    };

    window.addEventListener('resize', handleResize);
    handleResize();
    return () => window.removeEventListener('resize', handleResize);
  }, [config.width, config.height]);

  // Main Draw Loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    onCanvasReady(canvas);

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';

    canvas.width = config.width;
    canvas.height = config.height;

    // --- 1. Draw Background ---
    if (config.backgroundType === 'solid') {
      ctx.fillStyle = config.backgroundColor;
      ctx.fillRect(0, 0, config.width, config.height);
    } else {
      let gradient: CanvasGradient;
      const { width, height } = config;
      
      switch (config.gradientDirection) {
        case 'to-r':
          gradient = ctx.createLinearGradient(0, 0, width, 0);
          break;
        case 'to-b':
          gradient = ctx.createLinearGradient(0, 0, 0, height);
          break;
        case 'to-br':
        default:
          gradient = ctx.createLinearGradient(0, 0, width, height);
          break;
      }
      
      gradient.addColorStop(0, config.gradientStart);
      gradient.addColorStop(1, config.gradientEnd);
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, width, height);
    }

    // --- 2. Pattern ---
    if (config.backgroundPattern !== 'none') {
        ctx.save();
        ctx.fillStyle = 'rgba(255, 255, 255, 0.07)';
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.07)';
        
        if (config.backgroundPattern === 'dots') {
            const spacing = 40;
            const radius = 2;
            for (let x = 0; x < config.width; x += spacing) {
                for (let y = 0; y < config.height; y += spacing) {
                    ctx.beginPath();
                    ctx.arc(x, y, radius, 0, Math.PI * 2);
                    ctx.fill();
                }
            }
        } else if (config.backgroundPattern === 'grid') {
             const gridSize = 60;
             ctx.lineWidth = 1;
             ctx.beginPath();
             for (let x = 0; x <= config.width; x += gridSize) {
                 ctx.moveTo(x, 0);
                 ctx.lineTo(x, config.height);
             }
             for (let y = 0; y <= config.height; y += gridSize) {
                 ctx.moveTo(0, y);
                 ctx.lineTo(config.width, y);
             }
             ctx.stroke();
        }
        ctx.restore();
    }

    // --- 3. Text ---
    const centerX = config.width / 2;
    const centerY = config.height / 2;

    if (config.showText) {
      ctx.save();
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillStyle = config.textColor;
      
      // Title
      // If editing title, don't draw it (the input will cover it)
      if (editingTarget !== 'title') {
        ctx.font = `800 ${config.titleFontSize}px ${config.fontFamily}`;
        ctx.shadowColor = 'rgba(0,0,0,0.3)';
        ctx.shadowBlur = 20;
        ctx.shadowOffsetY = 10;
        const titleX = centerX + config.titleOffset.x;
        const titleY = centerY + config.titleOffset.y;
        ctx.fillText(config.title, titleX, titleY);
      }
      
      // Measure bounds regardless of editing state so we know where to put input
      ctx.font = `800 ${config.titleFontSize}px ${config.fontFamily}`;
      const titleMetrics = ctx.measureText(config.title);
      const titleH = config.titleFontSize * 1.2; // roughly line height
      const titleW = Math.max(200, titleMetrics.width); // min width for ease of clicking
      boundsRef.current['title'] = {
          x: centerX + config.titleOffset.x - titleW/2,
          y: centerY + config.titleOffset.y - titleH/2,
          w: titleW,
          h: titleH
      };

      // Subtitle
      if (editingTarget !== 'subtitle') {
        ctx.shadowBlur = 0; 
        ctx.shadowOffsetY = 0;
        ctx.font = `400 ${config.subtitleFontSize}px ${config.fontFamily}`;
        ctx.globalAlpha = 0.8;
        const subX = centerX + config.subtitleOffset.x;
        const subY = centerY + config.subtitleOffset.y;
        ctx.fillText(config.subtitle, subX, subY);
      }

      ctx.font = `400 ${config.subtitleFontSize}px ${config.fontFamily}`;
      const subMetrics = ctx.measureText(config.subtitle);
      const subH = config.subtitleFontSize * 1.2;
      const subW = Math.max(150, subMetrics.width);
      boundsRef.current['subtitle'] = {
          x: centerX + config.subtitleOffset.x - subW/2,
          y: centerY + config.subtitleOffset.y - subH/2,
          w: subW,
          h: subH
      };

      ctx.restore();
    } else {
        delete boundsRef.current['title'];
        delete boundsRef.current['subtitle'];
    }

    // --- 4. Screenshot ---
    if (image) {
      const padding = 100;
      const safeW = config.width - padding;
      const safeH = config.height - padding;
      const fitScaleW = safeW / image.width;
      const fitScaleH = safeH / image.height;
      const fitScale = Math.min(fitScaleW, fitScaleH);
      
      const finalScale = fitScale * config.imageScale;
      const drawW = image.width * finalScale;
      const drawH = image.height * finalScale;
      
      const imgCenterX = centerX + config.imageOffset.x;
      const imgCenterY = centerY + config.imageOffset.y;
      
      boundsRef.current['image'] = {
          x: imgCenterX - drawW/2,
          y: imgCenterY - drawH/2,
          w: drawW,
          h: drawH
      };

      ctx.save();
      ctx.translate(imgCenterX, imgCenterY);
      ctx.rotate((config.imageRotation * Math.PI) / 180);
      ctx.translate(-drawW / 2, -drawH / 2);

      // Shadow
      if (config.imageShadow > 0) {
        ctx.save();
        ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
        ctx.shadowBlur = config.imageShadow;
        ctx.shadowOffsetY = config.imageShadow * 0.4;
        const frameHeight = config.frameStyle !== 'none' ? 40 : 0;
        ctx.fillStyle = 'black'; 
        drawRoundedRect(ctx, 0, 0, drawW, drawH + frameHeight, config.imageRadius);
        ctx.fill();
        ctx.restore();
      }

      // Frame & Image
      let contentOffsetY = 0;
      if (config.frameStyle !== 'none') {
        const frameH = 40 * (config.imageScale < 0.6 ? 0.8 : 1);
        contentOffsetY = frameH;

        // Frame
        const isDark = config.frameStyle.includes('dark');
        const isGlass = config.frameStyle === 'glass';
        ctx.fillStyle = isGlass ? 'rgba(255, 255, 255, 0.2)' : isDark ? '#1e293b' : '#f8fafc';
        drawRoundedRect(ctx, 0, 0, drawW, drawH + frameH, config.imageRadius);
        ctx.fill();

        if (!isGlass) {
            ctx.save();
            ctx.beginPath();
            drawRoundedRect(ctx, 0, 0, drawW, frameH * 2, config.imageRadius); 
            ctx.clip();
            ctx.fillStyle = isDark ? '#1e293b' : '#e2e8f0';
            ctx.fillRect(0, 0, drawW, frameH);
            ctx.restore();
        }

        if (config.frameStyle.includes('macos')) {
            const circleY = frameH / 2;
            const startX = 20; const gap = 20; const radius = 6;
            ctx.fillStyle = '#ff5f56'; ctx.beginPath(); ctx.arc(startX, circleY, radius, 0, Math.PI*2); ctx.fill();
            ctx.fillStyle = '#ffbd2e'; ctx.beginPath(); ctx.arc(startX + gap, circleY, radius, 0, Math.PI*2); ctx.fill();
            ctx.fillStyle = '#27c93f'; ctx.beginPath(); ctx.arc(startX + gap*2, circleY, radius, 0, Math.PI*2); ctx.fill();
        }
      }

      ctx.save();
      if (config.frameStyle !== 'none') {
        drawRoundedRect(ctx, 0, 0, drawW, drawH + contentOffsetY, config.imageRadius);
        ctx.clip();
        ctx.drawImage(image, 0, contentOffsetY, drawW, drawH);
      } else {
        drawRoundedRect(ctx, 0, 0, drawW, drawH, config.imageRadius);
        ctx.clip();
        ctx.drawImage(image, 0, 0, drawW, drawH);
      }
      ctx.restore();

      if (config.frameStyle === 'glass') {
          ctx.save();
          drawRoundedRect(ctx, 0, 0, drawW, drawH + contentOffsetY, config.imageRadius);
          ctx.clip();
          const grad = ctx.createLinearGradient(0, 0, drawW, drawH);
          grad.addColorStop(0, 'rgba(255,255,255,0.15)');
          grad.addColorStop(0.4, 'rgba(255,255,255,0)');
          ctx.fillStyle = grad;
          ctx.fillRect(0,0,drawW, drawH + contentOffsetY);
          ctx.restore();
          ctx.strokeStyle = 'rgba(255,255,255,0.2)';
          ctx.lineWidth = 1;
          drawRoundedRect(ctx, 0, 0, drawW, drawH + contentOffsetY, config.imageRadius);
          ctx.stroke();
      }

      ctx.restore();
    } else {
         delete boundsRef.current['image'];
    }

    // --- 5. Selection Indicators (Overlay) ---
    // Drawn on top of everything when hovering
    if (!editingTarget && hoverTarget && boundsRef.current[hoverTarget]) {
        const b = boundsRef.current[hoverTarget];
        ctx.save();
        ctx.strokeStyle = '#3b82f6'; // Blue
        ctx.lineWidth = 2;
        ctx.setLineDash([4, 4]);
        const p = 10;
        ctx.strokeRect(b.x - p, b.y - p, b.w + p*2, b.h + p*2);
        
        ctx.fillStyle = '#3b82f6';
        ctx.fillRect(b.x - p, b.y - p - 24, 120, 24);
        ctx.fillStyle = 'white';
        ctx.font = 'bold 12px Inter';
        ctx.textAlign = 'left';
        ctx.textBaseline = 'middle';
        const label = hoverTarget === 'image' ? 'Drag / Scroll' : 'Double-click to Edit';
        ctx.fillText(label, b.x - p + 8, b.y - p - 12);
        ctx.restore();
    }

  }, [config, image, hoverTarget, isDragging, editingTarget]);


  // --- Event Handlers ---

  const getCanvasCoords = (e: React.MouseEvent | React.WheelEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    return {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY
    };
  };

  const checkHit = (x: number, y: number): DragTarget => {
    const targets: DragTarget[] = ['image', 'subtitle', 'title'];
    for (const t of targets) {
        const b = boundsRef.current[t];
        if (b) {
            if (x >= b.x && x <= b.x + b.w && y >= b.y && y <= b.y + b.h) {
                return t;
            }
        }
    }
    return null;
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (editingTarget) return; // Don't drag if editing
    
    const { x, y } = getCanvasCoords(e);
    const target = checkHit(x, y);
    
    if (target) {
        setIsDragging(true);
        setHoverTarget(target);
        dragStartRef.current = { x, y };
        
        if (target === 'image') initialOffsetRef.current = { ...config.imageOffset };
        else if (target === 'title') initialOffsetRef.current = { ...config.titleOffset };
        else if (target === 'subtitle') initialOffsetRef.current = { ...config.subtitleOffset };
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (editingTarget) return;

    const { x, y } = getCanvasCoords(e);

    if (isDragging && dragStartRef.current && initialOffsetRef.current && hoverTarget) {
        const dx = x - dragStartRef.current.x;
        const dy = y - dragStartRef.current.y;
        
        const newConfig = { ...config };
        const newOffset = {
            x: initialOffsetRef.current.x + dx,
            y: initialOffsetRef.current.y + dy
        };

        if (hoverTarget === 'image') newConfig.imageOffset = newOffset;
        else if (hoverTarget === 'title') newConfig.titleOffset = newOffset;
        else if (hoverTarget === 'subtitle') newConfig.subtitleOffset = newOffset;

        onChange(newConfig);
    } else {
        const target = checkHit(x, y);
        setHoverTarget(target);
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
    dragStartRef.current = null;
    initialOffsetRef.current = null;
  };

  const handleDoubleClick = (e: React.MouseEvent) => {
      const { x, y } = getCanvasCoords(e);
      const target = checkHit(x, y);
      
      if (target === 'title' || target === 'subtitle') {
          setEditingTarget(target);
          setEditText(target === 'title' ? config.title : config.subtitle);
          setHoverTarget(null);
      }
  };

  const handleTextCommit = () => {
      if (editingTarget === 'title') {
          onChange({ ...config, title: editText });
      } else if (editingTarget === 'subtitle') {
          onChange({ ...config, subtitle: editText });
      }
      setEditingTarget(null);
  };

  const handleWheel = (e: React.WheelEvent) => {
    if (editingTarget) return;

    if (hoverTarget) {
        e.preventDefault();
        const delta = e.deltaY > 0 ? -1 : 1; 
        const newConfig = { ...config };
        
        if (hoverTarget === 'image') {
            const step = 0.05;
            const newScale = Math.max(0.1, Math.min(2.0, config.imageScale + (delta * step)));
            newConfig.imageScale = newScale;
        } else if (hoverTarget === 'title') {
            const step = 4;
            newConfig.titleFontSize = Math.max(12, config.titleFontSize + (delta * step));
        } else if (hoverTarget === 'subtitle') {
            const step = 2;
            newConfig.subtitleFontSize = Math.max(12, config.subtitleFontSize + (delta * step));
        }
        onChange(newConfig);
    }
  };

  const drawRoundedRect = (ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) => {
    if (w < 2 * r) r = w / 2;
    if (h < 2 * r) r = h / 2;
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.arcTo(x + w, y, x + w, y + h, r);
    ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r);
    ctx.arcTo(x, y, x + w, y, r);
    ctx.closePath();
  }

  // Get style for input element
  const getInputStyle = () => {
      if (!editingTarget) return {};
      const bounds = boundsRef.current[editingTarget];
      if (!bounds) return {};

      // We need to add a bit of padding to the input so it doesn't feel cramped
      // and match the font size and family
      const fontSize = editingTarget === 'title' ? config.titleFontSize : config.subtitleFontSize;
      
      return {
          left: bounds.x - 20, // Add padding
          top: bounds.y - 10,
          width: bounds.w + 40,
          height: bounds.h + 20,
          fontSize: `${fontSize}px`,
          fontFamily: config.fontFamily,
          fontWeight: editingTarget === 'title' ? 800 : 400,
          color: config.textColor,
          textAlign: 'center' as const,
      };
  };

  return (
    <div ref={containerRef} className="flex-1 w-full h-full flex items-center justify-center p-8 bg-slate-950 overflow-hidden relative">
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{
          backgroundImage: 'radial-gradient(#fff 1px, transparent 1px)',
          backgroundSize: '32px 32px'
      }}></div>

      <div 
        style={{
          transform: `scale(${scaleFactor})`,
          transformOrigin: 'center center',
          boxShadow: '0 25px 100px -20px rgba(0, 0, 0, 0.7)'
        }}
        className="transition-transform duration-200 ease-out will-change-transform relative"
      >
        <canvas 
            ref={canvasRef} 
            className={`max-w-none shadow-2xl ${hoverTarget && !editingTarget ? 'cursor-move' : 'cursor-default'}`}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            onDoubleClick={handleDoubleClick}
            onWheel={handleWheel}
        />

        {/* In-Place Text Editor */}
        {editingTarget && (
            <input
                autoFocus
                value={editText}
                onChange={(e) => setEditText(e.target.value)}
                onBlur={handleTextCommit}
                onKeyDown={(e) => e.key === 'Enter' && handleTextCommit()}
                className="absolute bg-black/50 border-2 border-indigo-500 rounded focus:outline-none backdrop-blur-sm"
                style={getInputStyle()}
            />
        )}
      </div>
      
      {/* Hint Toast */}
      {!editingTarget && (
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-slate-800/80 backdrop-blur-sm px-4 py-2 rounded-full border border-slate-700 text-xs text-slate-300 pointer-events-none transition-opacity">
            💡 Tip: Drag to move • Scroll to resize • Double-click text to edit
        </div>
      )}
    </div>
  );
};

export default PromoCanvas;