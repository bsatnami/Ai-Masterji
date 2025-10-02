import React, { useState } from 'react';
import type { Poster, Language } from '../types';
import { UI_TEXT } from '../constants';
import { GridIcon, ZoomInIcon, ZoomOutIcon, DownloadIcon } from './icons/EditorIcons';
import { Spinner } from './ui/Spinner';

interface CenterCanvasProps {
  activePoster: Poster | null;
  isLoading: boolean;
  loadingMessage: string;
  language: Language;
}

export const CenterCanvas: React.FC<CenterCanvasProps> = ({ activePoster, isLoading, loadingMessage, language }) => {
  const [showGrid, setShowGrid] = useState(false);
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const t = (key: string) => UI_TEXT[language][key] || key;

  const handleDownload = () => {
    if (!activePoster) return;
    const link = document.createElement('a');
    link.href = activePoster.url;
    link.download = `${activePoster.name.replace(/\s+/g, '_')}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const newScale = Math.max(0.1, Math.min(5, scale - e.deltaY * 0.001));
    setScale(newScale);
  };

  return (
    <div className="flex-grow bg-gray-900/50 flex items-center justify-center overflow-hidden relative" onWheel={handleWheel}>
      {isLoading ? (
        <div className="flex flex-col items-center text-center p-8 bg-gray-800/50 rounded-lg">
          <Spinner />
          <p className="mt-4 text-lg font-semibold text-indigo-300">{loadingMessage || t('generating')}</p>
        </div>
      ) : activePoster ? (
        <div 
          className="relative transition-transform duration-100"
          style={{ transform: `scale(${scale}) translate(${position.x}px, ${position.y}px)` }}
        >
          <img src={activePoster.url} alt={activePoster.name} className="max-w-full max-h-full object-contain shadow-2xl" />
          {showGrid && (
            <div className="absolute inset-0 grid grid-cols-3 grid-rows-3 pointer-events-none">
              <div className="col-span-1 row-span-3 border-r border-white/30"></div>
              <div className="col-span-1 row-span-3 border-r border-white/30"></div>
              <div className="row-span-1 col-span-3 border-b border-white/30"></div>
              <div className="row-span-1 col-span-3 border-b border-white/30"></div>
            </div>
          )}
        </div>
      ) : (
        <div className="text-center text-gray-500 p-8">
          <h2 className="text-2xl font-bold">{t('projectTitle')}</h2>
          <p className="mt-2">{t('canvasPlaceholder')}</p>
        </div>
      )}

      <div className="absolute bottom-4 right-4 flex items-center space-x-2 bg-gray-800/80 p-2 rounded-lg backdrop-blur-sm">
        <button onClick={() => setScale(s => Math.max(0.1, s - 0.2))} className="p-2 text-gray-300 hover:text-white hover:bg-gray-700 rounded-md" title="Zoom Out">
          <ZoomOutIcon className="w-5 h-5" />
        </button>
        <span className="text-sm font-mono w-12 text-center">{Math.round(scale * 100)}%</span>
        <button onClick={() => setScale(s => Math.min(5, s + 0.2))} className="p-2 text-gray-300 hover:text-white hover:bg-gray-700 rounded-md" title="Zoom In">
          <ZoomInIcon className="w-5 h-5" />
        </button>
        <button
          onClick={() => setShowGrid(!showGrid)}
          className={`p-2 rounded-md transition-colors ${showGrid ? 'bg-indigo-600 text-white' : 'text-gray-300 hover:bg-gray-700'}`}
          title={t('toggleRuleOfThirds')}
        >
          <GridIcon className="w-5 h-5" />
        </button>
         {activePoster && (
          <button onClick={handleDownload} className="p-2 text-gray-300 hover:text-white hover:bg-gray-700 rounded-md" title="Download Poster">
            <DownloadIcon className="w-5 h-5" />
          </button>
        )}
      </div>
    </div>
  );
};
