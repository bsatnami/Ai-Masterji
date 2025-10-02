import React from 'react';
import type { Settings, Language, StyleAnalysis } from '../types';
import { UI_TEXT } from '../constants';
import { Button } from './ui/Button';
import { Select } from './ui/Select';
import { SparklesIcon, RefreshIcon } from './icons/EditorIcons';
import { CreativeConceptBox } from './CreativeConceptBox';
import { StyleAnalysisPanel } from './StyleAnalysisPanel';

interface RightSidebarProps {
  settings: Settings;
  onSettingsChange: (settings: Settings) => void;
  onGenerate: () => void;
  creativeConcept: string;
  isLoading: boolean;
  language: Language;
  hasUploadedContent: boolean;
  promptSuggestions: string[];
  onGetSuggestions: () => void;
  styleAnalysis: StyleAnalysis | null;
}

export const RightSidebar: React.FC<RightSidebarProps> = (props) => {
  const { 
    settings, onSettingsChange, onGenerate, creativeConcept, isLoading, language, 
    hasUploadedContent, promptSuggestions, onGetSuggestions, styleAnalysis 
  } = props;
  const t = (key: string) => UI_TEXT[language][key] || key;

  const handleSettingChange = <K extends keyof Settings,>(key: K, value: Settings[K]) => {
    onSettingsChange({ ...settings, [key]: value });
  };
  
  return (
    <aside className="w-96 bg-gray-800 p-4 flex-shrink-0 flex flex-col space-y-4 overflow-y-auto">
      <div>
        <h3 className="text-sm font-bold text-gray-400 uppercase">{t('posterSettings')}</h3>
        <div className="space-y-3 mt-2">
            <Select
              label={t('aspectRatio')}
              value={settings.aspectRatio}
              onChange={(e) => handleSettingChange('aspectRatio', e.target.value as Settings['aspectRatio'])}
            >
              <option value="9:16">9:16 (Story)</option>
              <option value="1:1">1:1 (Square)</option>
              <option value="16:9">16:9 (Landscape)</option>
              <option value="3:4">3:4 (Portrait)</option>
              <option value="4:3">4:3 (Classic)</option>
            </Select>

            <Select
              label={t('lightingStyle')}
              value={settings.lightingStyle}
              onChange={(e) => handleSettingChange('lightingStyle', e.target.value as Settings['lightingStyle'])}
            >
              <option>Cinematic</option>
              <option>Studio</option>
              <option>Dramatic</option>
              <option>Natural</option>
              <option>Vibrant</option>
            </Select>

            <Select
              label={t('cameraPerspective')}
              value={settings.cameraPerspective}
              onChange={(e) => handleSettingChange('cameraPerspective', e.target.value as Settings['cameraPerspective'])}
            >
              <option>Wide Angle</option>
              <option>Close Up</option>
              <option>Top Down</option>
              <option>Dynamic</option>
            </Select>
        </div>
      </div>

      <StyleAnalysisPanel analysis={styleAnalysis} title={t('styleAnalysis')} />
      <CreativeConceptBox concept={creativeConcept} title={t('creativeConcept')} />
      
      <div>
        <h3 className="text-sm font-bold text-gray-400 uppercase mb-2">{t('creativePrompt')}</h3>
        <textarea
          value={settings.prompt}
          onChange={(e) => handleSettingChange('prompt', e.target.value)}
          placeholder="Describe the poster you want to create..."
          className="w-full bg-gray-700 border border-gray-600 rounded-md p-2 text-sm text-gray-300 resize-none h-28 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
        />
      </div>

      <div>
        <div className="flex justify-between items-center mb-2">
            <h3 className="text-sm font-bold text-gray-400 uppercase">{t('aiPromptSuggestions')}</h3>
            <button onClick={onGetSuggestions} className="p-1 text-gray-400 hover:text-white" title="Get new suggestions">
                <RefreshIcon className="w-4 h-4" />
            </button>
        </div>
        <div className="space-y-2">
            {promptSuggestions.map((suggestion, index) => (
                <button 
                    key={index}
                    onClick={() => handleSettingChange('prompt', suggestion)}
                    className="w-full text-left text-xs p-2 bg-gray-700/50 rounded-md hover:bg-gray-700 transition-colors"
                >
                    {suggestion}
                </button>
            ))}
        </div>
      </div>
      
      <div className="flex-grow"></div>

      <Button onClick={onGenerate} disabled={isLoading || !hasUploadedContent} variant="primary" className="w-full">
        {isLoading ? t('generating') : (
            <div className="flex items-center justify-center">
                <SparklesIcon className="w-5 h-5 mr-2" />
                {t('generatePoster')}
            </div>
        )}
      </Button>
    </aside>
  );
};
