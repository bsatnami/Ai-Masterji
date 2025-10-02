import React from 'react';
import type { StyleAnalysis } from '../types';
import { LightbulbIcon } from './icons/EditorIcons';

interface StyleAnalysisPanelProps {
  analysis: StyleAnalysis | null;
  title: string;
}

export const StyleAnalysisPanel: React.FC<StyleAnalysisPanelProps> = ({ analysis, title }) => {
  if (!analysis) return null;

  return (
    <div>
      <h3 className="text-sm font-bold text-gray-400 uppercase mb-2 flex items-center">
        <LightbulbIcon className="w-4 h-4 mr-2 text-yellow-400" />
        {title}
      </h3>
      <div className="space-y-3 p-3 bg-gray-900/50 rounded-lg border border-gray-700">
        <div>
          <h4 className="text-xs font-semibold text-gray-400 mb-1">Vibe</h4>
          <p className="text-sm text-gray-200">{analysis.vibe}</p>
        </div>
        <div>
          <h4 className="text-xs font-semibold text-gray-400 mb-1">Color Palette</h4>
          <div className="flex flex-wrap gap-2">
            {analysis.palette.map((color, index) => (
              <div key={index} className="w-6 h-6 rounded-full border-2 border-gray-600" style={{ backgroundColor: color }} title={color} />
            ))}
          </div>
        </div>
        <div>
          <h4 className="text-xs font-semibold text-gray-400 mb-1">Keywords</h4>
          <div className="flex flex-wrap gap-1">
            {analysis.keywords.map((keyword, index) => (
              <span key={index} className="text-xs bg-gray-700 text-gray-300 px-2 py-1 rounded-full">{keyword}</span>
            ))}
          </div>
        </div>
         <div>
          <h4 className="text-xs font-semibold text-gray-400 mb-1">Lighting</h4>
          <p className="text-xs text-gray-300">{analysis.lighting}</p>
        </div>
        <div>
          <h4 className="text-xs font-semibold text-gray-400 mb-1">Composition</h4>
          <p className="text-xs text-gray-300">{analysis.composition}</p>
        </div>
      </div>
    </div>
  );
};
