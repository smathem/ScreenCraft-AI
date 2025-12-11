import React from 'react';
import { PromoConfig, DEFAULT_CONFIG, PRESETS, FrameStyle, BackgroundPattern } from '../types';

interface ConfigSidebarProps {
  config: PromoConfig;
  onChange: (newConfig: PromoConfig) => void;
  isGenerating: boolean;
  onAutoGenerate: () => void;
  hasImage: boolean;
}

const PALETTES = [
    { name: 'Hyper', start: '#ec4899', end: '#8b5cf6' },
    { name: 'Ocean', start: '#3b82f6', end: '#06b6d4' },
    { name: 'Sunset', start: '#f97316', end: '#db2777' },
    { name: 'Forest', start: '#10b981', end: '#0f766e' },
    { name: 'Midnight', start: '#1e293b', end: '#0f172a' },
    { name: 'Peach', start: '#f43f5e', end: '#fbbf24' },
];

const RATIOS = [
    { label: '16:9', w: 1600, h: 900 },
    { label: '1:1', w: 1080, h: 1080 },
    { label: '4:5', w: 1080, h: 1350 },
    { label: '4:3', w: 1600, h: 1200 },
];

const ConfigSidebar: React.FC<ConfigSidebarProps> = ({ 
  config, 
  onChange, 
  isGenerating, 
  onAutoGenerate,
  hasImage
}) => {
  
  const handleChange = (key: keyof PromoConfig, value: any) => {
    onChange({ ...config, [key]: value });
  };
  
  const handleNestedChange = (parent: keyof PromoConfig, subKey: string, value: any) => {
      const current = config[parent] as any;
      onChange({ ...config, [parent]: { ...current, [subKey]: value } });
  };

  const handlePresetChange = (key: string) => {
    const preset = PRESETS[key as keyof typeof PRESETS];
    if (preset) {
      onChange({ ...config, width: preset.width, height: preset.height });
    }
  };

  const applyPalette = (start: string, end: string) => {
      onChange({
          ...config,
          backgroundType: 'gradient',
          gradientStart: start,
          gradientEnd: end
      });
  };

  const swapDimensions = () => {
      onChange({ ...config, width: config.height, height: config.width });
  }

  const setSize = (w: number, h: number) => {
      onChange({ ...config, width: w, height: h });
  }

  return (
    <div className="w-full md:w-80 shrink-0 bg-slate-800 border-t md:border-t-0 md:border-l border-slate-700 h-[45%] md:h-full overflow-y-auto flex flex-col shadow-2xl z-20 transition-all duration-300">
      <div className="p-4 border-b border-slate-700 sticky top-0 bg-slate-800 z-10">
        <h2 className="text-lg font-semibold text-white mb-1">Configuration</h2>
        <p className="text-xs text-slate-400">Customize your output</p>
      </div>

      <div className="p-4 space-y-8 flex-1">
        {/* AI Action */}
        <div className="bg-gradient-to-r from-indigo-900/40 to-purple-900/40 p-4 rounded-lg border border-indigo-500/30">
          <div className="flex items-center justify-between mb-3">
             <h3 className="text-indigo-300 text-sm font-semibold">AI Assistant</h3>
             <span className="text-[10px] bg-indigo-500/20 text-indigo-300 px-1.5 py-0.5 rounded uppercase tracking-wider">Gemini</span>
          </div>
          <button
            onClick={onAutoGenerate}
            disabled={!hasImage || isGenerating}
            className={`w-full py-2.5 px-3 rounded-md text-sm font-medium transition-all duration-200 flex items-center justify-center gap-2
              ${!hasImage 
                ? 'bg-slate-700 text-slate-500 cursor-not-allowed' 
                : isGenerating 
                  ? 'bg-indigo-700 text-indigo-200 cursor-wait' 
                  : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-900/50 hover:shadow-indigo-900/70 border border-indigo-500/50'}`}
          >
            {isGenerating ? (
              <>
                <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Magic Design...
              </>
            ) : (
              <>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                Auto-Style Image
              </>
            )}
          </button>
        </div>

        {/* Canvas Size */}
        <div>
          <div className="flex justify-between items-center mb-3">
             <h3 className="text-slate-200 text-sm font-medium">Canvas Size</h3>
             <select 
                className="bg-slate-900 text-[10px] border border-slate-700 rounded px-1 py-0.5 text-slate-400 focus:outline-none focus:border-indigo-500 max-w-[120px]"
                onChange={(e) => handlePresetChange(e.target.value)}
                defaultValue=""
             >
                <option value="" disabled>Presets...</option>
                {Object.entries(PRESETS).map(([key, val]) => (
                   <option key={key} value={key}>{val.label}</option>
                ))}
             </select>
          </div>
          
          {/* Quick Ratios */}
          <div className="flex gap-2 mb-3">
              {RATIOS.map(r => (
                  <button 
                    key={r.label}
                    onClick={() => setSize(r.w, r.h)}
                    className={`flex-1 py-1 text-[10px] rounded border transition-colors ${
                        config.width === r.w && config.height === r.h 
                        ? 'bg-indigo-600 border-indigo-500 text-white' 
                        : 'bg-slate-900 border-slate-700 text-slate-400 hover:border-slate-500'
                    }`}
                  >
                      {r.label}
                  </button>
              ))}
          </div>

          <div className="grid grid-cols-[1fr_auto_1fr] gap-2 items-end">
            <div className="relative">
              <label className="text-[10px] uppercase tracking-wider text-slate-500 absolute top-1.5 left-2">W</label>
              <input
                type="number"
                value={config.width}
                onChange={(e) => handleChange('width', Number(e.target.value))}
                className="w-full bg-slate-900 border border-slate-700 rounded pl-8 pr-2 py-1.5 text-sm text-white focus:ring-1 focus:ring-indigo-500 outline-none"
              />
            </div>
            
            <button 
                onClick={swapDimensions}
                className="p-2 mb-[1px] text-slate-500 hover:text-indigo-400 hover:bg-slate-700 rounded transition-colors"
                title="Swap Dimensions"
            >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" /></svg>
            </button>

            <div className="relative">
              <label className="text-[10px] uppercase tracking-wider text-slate-500 absolute top-1.5 left-2">H</label>
              <input
                type="number"
                value={config.height}
                onChange={(e) => handleChange('height', Number(e.target.value))}
                className="w-full bg-slate-900 border border-slate-700 rounded pl-8 pr-2 py-1.5 text-sm text-white focus:ring-1 focus:ring-indigo-500 outline-none"
              />
            </div>
          </div>
        </div>

        {/* Text */}
        <div>
           <div className="flex justify-between items-center mb-3">
            <h3 className="text-slate-200 text-sm font-medium">Text Overlay</h3>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" checked={config.showText} onChange={(e) => handleChange('showText', e.target.checked)} className="sr-only peer" />
              <div className="w-9 h-5 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-indigo-600"></div>
            </label>
          </div>
          
          {config.showText && (
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-xs text-slate-400 block">Title</label>
                <input
                  type="text"
                  value={config.title}
                  onChange={(e) => handleChange('title', e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1.5 text-sm text-white focus:ring-1 focus:ring-indigo-500 outline-none"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs text-slate-400 block">Subtitle</label>
                <input
                  type="text"
                  value={config.subtitle}
                  onChange={(e) => handleChange('subtitle', e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1.5 text-sm text-white focus:ring-1 focus:ring-indigo-500 outline-none"
                />
              </div>

               <div>
                <label className="text-xs text-slate-400 block mb-2">Text Color</label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={config.textColor}
                    onChange={(e) => handleChange('textColor', e.target.value)}
                    className="h-8 w-8 rounded cursor-pointer bg-transparent border-none p-0"
                  />
                  <input
                    type="text"
                    value={config.textColor}
                    onChange={(e) => handleChange('textColor', e.target.value)}
                    className="flex-1 bg-slate-900 border border-slate-700 text-xs text-slate-300 rounded px-2 h-8 focus:outline-none focus:border-indigo-500 uppercase"
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Background */}
        <div>
          <h3 className="text-slate-200 text-sm font-medium mb-3">Background</h3>
          
          {/* Palettes */}
          <div className="grid grid-cols-6 gap-1 mb-4">
              {PALETTES.map((p) => (
                  <button 
                    key={p.name}
                    onClick={() => applyPalette(p.start, p.end)}
                    className="h-8 rounded border border-slate-700 hover:scale-110 transition-transform relative group"
                    style={{ background: `linear-gradient(to bottom right, ${p.start}, ${p.end})` }}
                  >
                     <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 px-1.5 py-0.5 bg-black text-[10px] text-white rounded opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap z-10">
                         {p.name}
                     </span>
                  </button>
              ))}
          </div>

          <div className="flex gap-2 mb-3 bg-slate-900 p-1 rounded">
            <button 
              className={`flex-1 text-xs py-1 rounded transition-colors ${config.backgroundType === 'gradient' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'}`}
              onClick={() => handleChange('backgroundType', 'gradient')}
            >
              Gradient
            </button>
            <button 
              className={`flex-1 text-xs py-1 rounded transition-colors ${config.backgroundType === 'solid' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'}`}
              onClick={() => handleChange('backgroundType', 'solid')}
            >
              Solid
            </button>
          </div>

          <div className="space-y-3 mb-4">
          {config.backgroundType === 'solid' ? (
            <div>
              <label className="text-xs text-slate-400 block mb-1">Color</label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={config.backgroundColor}
                  onChange={(e) => handleChange('backgroundColor', e.target.value)}
                  className="h-8 w-8 rounded cursor-pointer bg-transparent border-none p-0"
                />
                <input 
                  type="text" 
                  value={config.backgroundColor} 
                  onChange={(e) => handleChange('backgroundColor', e.target.value)}
                  className="bg-slate-900 border border-slate-700 text-xs text-slate-300 rounded px-2 h-8 flex-1 focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-slate-400 block mb-1">From</label>
                  <div className="flex items-center gap-2">
                    <input
                        type="color"
                        value={config.gradientStart}
                        onChange={(e) => handleChange('gradientStart', e.target.value)}
                        className="h-8 w-8 rounded cursor-pointer bg-transparent border-none p-0 shrink-0"
                    />
                    <input
                        type="text"
                        value={config.gradientStart}
                        onChange={(e) => handleChange('gradientStart', e.target.value)}
                        className="w-full bg-slate-900 border border-slate-700 text-[10px] text-slate-300 rounded px-1 h-8 focus:outline-none focus:border-indigo-500 uppercase"
                    />
                  </div>
                </div>
                <div>
                  <label className="text-xs text-slate-400 block mb-1">To</label>
                   <div className="flex items-center gap-2">
                    <input
                        type="color"
                        value={config.gradientEnd}
                        onChange={(e) => handleChange('gradientEnd', e.target.value)}
                        className="h-8 w-8 rounded cursor-pointer bg-transparent border-none p-0 shrink-0"
                    />
                    <input
                        type="text"
                        value={config.gradientEnd}
                        onChange={(e) => handleChange('gradientEnd', e.target.value)}
                        className="w-full bg-slate-900 border border-slate-700 text-[10px] text-slate-300 rounded px-1 h-8 focus:outline-none focus:border-indigo-500 uppercase"
                    />
                  </div>
                </div>
              </div>
              <div>
                <label className="text-xs text-slate-400 block mb-1">Direction</label>
                <select 
                  value={config.gradientDirection}
                  onChange={(e) => handleChange('gradientDirection', e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1.5 text-sm text-white focus:ring-1 focus:ring-indigo-500 outline-none"
                >
                  <option value="to-r">Horizontal →</option>
                  <option value="to-b">Vertical ↓</option>
                  <option value="to-br">Diagonal ↘</option>
                </select>
              </div>
            </>
          )}
          </div>

          <div>
             <label className="text-xs text-slate-400 block mb-2">Pattern Overlay</label>
             <div className="flex gap-2">
                {(['none', 'dots', 'grid'] as BackgroundPattern[]).map(pat => (
                   <button
                    key={pat}
                    onClick={() => handleChange('backgroundPattern', pat)}
                    className={`flex-1 text-xs py-1.5 rounded border capitalize transition-all
                        ${config.backgroundPattern === pat
                            ? 'bg-slate-700 border-slate-500 text-white'
                            : 'bg-slate-900 border-slate-800 text-slate-500 hover:border-slate-600'
                        }`}
                   >
                     {pat}
                   </button>
                ))}
             </div>
          </div>
        </div>

        {/* Appearance (Screenshot) */}
        <div>
          <h3 className="text-slate-200 text-sm font-medium mb-3">Screenshot Appearance</h3>
          <div className="space-y-4">
             {/* Frame Style */}
            <div>
              <label className="text-xs text-slate-400 block mb-2">Window Frame</label>
              <div className="grid grid-cols-2 gap-2">
                {(['none', 'macos-dark', 'macos-light', 'glass'] as FrameStyle[]).map((style) => (
                  <button
                    key={style}
                    onClick={() => handleChange('frameStyle', style)}
                    className={`text-xs py-2 px-2 rounded border transition-all capitalize
                      ${config.frameStyle === style 
                        ? 'bg-indigo-600/20 border-indigo-500 text-indigo-300' 
                        : 'bg-slate-900 border-slate-700 text-slate-400 hover:border-slate-500'}`}
                  >
                    {style.replace('-', ' ')}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <div className="flex justify-between mb-1">
                <label className="text-xs text-slate-400">Scale</label>
                <span className="text-xs text-slate-500">{Math.round(config.imageScale * 100)}%</span>
              </div>
              <input
                type="range"
                min="0.4"
                max="1.5"
                step="0.05"
                value={config.imageScale}
                onChange={(e) => handleChange('imageScale', parseFloat(e.target.value))}
                className="w-full h-1 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-indigo-500"
              />
            </div>

            <div>
              <div className="flex justify-between mb-1">
                <label className="text-xs text-slate-400">Rotation</label>
                <span className="text-xs text-slate-500">{config.imageRotation}°</span>
              </div>
              <input
                type="range"
                min="-15"
                max="15"
                step="1"
                value={config.imageRotation}
                onChange={(e) => handleChange('imageRotation', parseInt(e.target.value))}
                className="w-full h-1 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-indigo-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
               <div>
                  <div className="flex justify-between mb-1">
                    <label className="text-xs text-slate-400">Rounding</label>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="40"
                    value={config.imageRadius}
                    onChange={(e) => handleChange('imageRadius', parseInt(e.target.value))}
                    className="w-full h-1 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                  />
               </div>
               <div>
                  <div className="flex justify-between mb-1">
                    <label className="text-xs text-slate-400">Shadow</label>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="150"
                    value={config.imageShadow}
                    onChange={(e) => handleChange('imageShadow', parseInt(e.target.value))}
                    className="w-full h-1 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                  />
               </div>
            </div>
            
             <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-slate-400">Offset X</label>
                <input
                    type="number"
                    value={Math.round(config.imageOffset.x)}
                    onChange={(e) => handleNestedChange('imageOffset', 'x', parseFloat(e.target.value))}
                    className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1 text-xs mt-1"
                />
              </div>
              <div>
                <label className="text-xs text-slate-400">Offset Y</label>
                <input
                    type="number"
                    value={Math.round(config.imageOffset.y)}
                    onChange={(e) => handleNestedChange('imageOffset', 'y', parseFloat(e.target.value))}
                    className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1 text-xs mt-1"
                />
              </div>
            </div>
          </div>
        </div>


        <div className="pt-4 border-t border-slate-700">
             <button 
             onClickCapture={() => onChange(DEFAULT_CONFIG)}
             className="w-full py-2 bg-slate-800 hover:bg-slate-700 border border-slate-600 rounded text-sm text-slate-300 transition-colors"
           >
             Reset to Defaults
           </button>
        </div>
      </div>
    </div>
  );
};

export default ConfigSidebar;