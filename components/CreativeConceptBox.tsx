import React from 'react';
import { LightbulbIcon } from './icons/EditorIcons';

interface CreativeConceptBoxProps {
  concept: string;
  title: string;
}

export const CreativeConceptBox: React.FC<CreativeConceptBoxProps> = ({ concept, title }) => {
  if (!concept) return null;

  return (
    <div>
      <h3 className="text-sm font-bold text-gray-400 uppercase mb-2 flex items-center">
         <LightbulbIcon className="w-4 h-4 mr-2 text-yellow-400" />
        {title}
      </h3>
      <div className="text-xs p-3 bg-gray-700/50 rounded-lg border border-gray-700">
          <p className="text-gray-300">{concept}</p>
      </div>
    </div>
  );
};