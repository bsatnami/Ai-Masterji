
import React from 'react';
import type { Language } from '../types';
import { UI_TEXT } from '../constants';
import { SaveIcon, ExportIcon } from './icons/EditorIcons';

interface HeaderProps {
    language: Language;
}

export const Header: React.FC<HeaderProps> = ({ language }) => {
    const t = (key: string) => UI_TEXT[language][key] || key;

    return (
        <header className="flex items-center justify-between p-3 bg-gray-800 border-b border-gray-700 shadow-md flex-shrink-0">
            <h1 className="text-xl font-bold text-indigo-400">{t('projectTitle')}</h1>
            <div className="flex items-center space-x-4">
                <button className="flex items-center px-3 py-2 text-sm font-medium text-gray-300 bg-gray-700 rounded-md hover:bg-gray-600 transition-colors">
                    <SaveIcon className="w-4 h-4 mr-2" />
                    {t('saveDraft')}
                </button>
                <button className="flex items-center px-3 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-500 transition-colors">
                    <ExportIcon className="w-4 h-4 mr-2" />
                    {t('export')}
                </button>
            </div>
        </header>
    );
};
