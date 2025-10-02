import React from 'react';
import type { Poster, Language } from '../types';
import { UI_TEXT } from '../constants';
import { DownloadIcon } from './icons/EditorIcons';

interface BottomLibraryProps {
  posters: Poster[];
  onSelectPoster: (poster: Poster) => void;
  activePosterId?: string | null;
  language: Language;
}

export const BottomLibrary: React.FC<BottomLibraryProps> = ({ posters, onSelectPoster, activePosterId, language }) => {
  const t = (key: string) => UI_TEXT[language][key] || key;
  
  const handleDownload = (e: React.MouseEvent, url: string, name: string) => {
    e.stopPropagation();
    const link = document.createElement('a');
    link.href = url;
    link.download = `${name}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="h-40 bg-gray-800/70 backdrop-blur-sm border-t border-gray-700 flex-shrink-0 p-3">
      <h3 className="text-xs font-bold text-gray-400 uppercase mb-2">{t('posterLibrary')}</h3>
      <div className="flex space-x-3 overflow-x-auto h-full pb-3">
        {posters.map(poster => (
          <div
            key={poster.id}
            onClick={() => onSelectPoster(poster)}
            className={`relative w-24 h-full flex-shrink-0 rounded-md overflow-hidden cursor-pointer group transition-all duration-200 ${
              activePosterId === poster.id ? 'ring-2 ring-indigo-500 scale-105' : 'ring-1 ring-gray-600 hover:ring-indigo-400'
            }`}
          >
            <img src={poster.url} alt={poster.name} className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <button onClick={(e) => handleDownload(e, poster.url, poster.name)} className="p-2 bg-white/20 rounded-full text-white hover:bg-white/40">
                    <DownloadIcon className="w-5 h-5" />
                </button>
            </div>
          </div>
        ))}
        {posters.length === 0 && (
          <div className="w-full h-full flex items-center justify-center text-sm text-gray-500">
            {t('libraryPlaceholder')}
          </div>
        )}
      </div>
    </div>
  );
};