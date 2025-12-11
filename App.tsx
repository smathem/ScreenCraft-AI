import React, { useState, useEffect } from 'react';
import { DEFAULT_CONFIG, PromoConfig } from './types';
import ConfigSidebar from './components/ConfigSidebar';
import PromoCanvas from './components/PromoCanvas';
import { analyzeImageForPromo } from './services/geminiService';

const App: React.FC = () => {
  const [config, setConfig] = useState<PromoConfig>(DEFAULT_CONFIG);
  const [image, setImage] = useState<HTMLImageElement | null>(null);
  const [imageBase64, setImageBase64] = useState<string | null>(null);
  const [canvasRef, setCanvasRef] = useState<HTMLCanvasElement | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const result = event.target?.result as string;
        const img = new Image();
        img.onload = () => {
          setImage(img);
          setImageBase64(result);
          setErrorMsg(null);
        };
        img.src = result;
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAutoGenerate = async () => {
    if (!imageBase64) return;
    setIsGenerating(true);
    setErrorMsg(null);

    try {
      const metadata = await analyzeImageForPromo(imageBase64);
      
      setConfig(prev => ({
        ...prev,
        title: metadata.title,
        subtitle: metadata.subtitle,
        backgroundType: 'gradient',
        gradientStart: metadata.primaryColor,
        gradientEnd: metadata.secondaryColor,
        gradientDirection: 'to-br',
      }));
    } catch (err) {
      setErrorMsg("Failed to generate styles. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownload = () => {
    if (canvasRef) {
      const link = document.createElement('a');
      link.download = `screencraft-promo-${Date.now()}.png`;
      link.href = canvasRef.toDataURL('image/png');
      link.click();
    }
  };

  return (
    <div className="flex flex-col h-screen bg-slate-900 text-white overflow-hidden">
      {/* Header */}
      <header className="h-16 border-b border-slate-700 flex items-center justify-between px-6 bg-slate-900 z-10 shrink-0">
        <div className="flex items-center gap-3">
            <div className="h-8 w-8 bg-gradient-to-br from-indigo-500 to-pink-500 rounded-lg flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
            </div>
            <h1 className="font-bold text-xl tracking-tight">ScreenCraft AI</h1>
        </div>

        <div className="flex items-center gap-4">
           {/* Simple File Input trigger */}
           <label className="cursor-pointer bg-slate-800 hover:bg-slate-700 text-slate-200 px-4 py-2 rounded-md text-sm font-medium transition-colors border border-slate-600 flex items-center gap-2">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" /></svg>
            <span className="hidden sm:inline">Upload Screenshot</span>
            <span className="sm:hidden">Upload</span>
            <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
          </label>

          <button
            onClick={handleDownload}
            disabled={!image}
            className={`px-4 py-2 rounded-md text-sm font-medium flex items-center gap-2 transition-all
                ${!image 
                    ? 'bg-slate-800 text-slate-600 cursor-not-allowed border border-slate-800' 
                    : 'bg-white text-slate-900 hover:bg-slate-100 shadow-lg shadow-white/10'}`}
          >
             <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
             <span className="hidden sm:inline">Export PNG</span>
             <span className="sm:hidden">Export</span>
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex flex-col md:flex-row overflow-hidden relative">
        {/* Editor Area (Canvas) */}
        {/* Fixed: Added md:w-auto min-w-0 to prevent flex item from forcing 100% width and pushing sidebar out */}
        <div className="relative flex flex-col min-h-0 bg-slate-950/50 w-full md:w-auto h-[55%] md:h-auto md:flex-1 min-w-0 transition-all duration-300">
            {errorMsg && (
                <div className="absolute top-4 left-1/2 -translate-x-1/2 z-20 bg-red-500/90 text-white px-4 py-2 rounded-md shadow-lg text-sm backdrop-blur-sm">
                    {errorMsg}
                </div>
            )}
            <PromoCanvas 
                config={config} 
                image={image} 
                onCanvasReady={setCanvasRef}
                onChange={setConfig}
            />
        </div>

        {/* Sidebar Controls */}
        <ConfigSidebar 
            config={config} 
            onChange={setConfig} 
            isGenerating={isGenerating}
            onAutoGenerate={handleAutoGenerate}
            hasImage={!!image}
        />
      </main>
    </div>
  );
};

export default App;