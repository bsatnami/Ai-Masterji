import { Poster, Settings, Style } from './types';

export const UI_TEXT = {
  en: {
    projectTitle: 'AI Master Ji',
    saveDraft: 'Save Draft',
    export: 'Export',
    generating: 'Generating...',
    applyingEdit: 'Applying Edit...',
    canvasPlaceholder: 'Upload a product image and a style reference to begin.',
    toggleRuleOfThirds: 'Toggle Rule of Thirds Grid',
    posterSettings: 'Poster Settings',
    aspectRatio: 'Aspect Ratio',
    lightingStyle: 'Lighting Style',
    cameraPerspective: 'Camera Perspective',
    creativeConcept: 'AI-Generated Master Prompt',
    creativePrompt: 'Creative Prompt',
    aiPromptSuggestions: 'AI Prompt Suggestions',
    generatePoster: 'Generate Poster',
    posterLibrary: 'Poster Library',
    productImages: 'Product Images',
    styleReference: 'Style Reference',
    editPoster: 'Edit Poster',
    applyEdit: 'Apply Edit',
    libraryPlaceholder: 'Your generated posters will appear here.',
    styleAnalysis: 'Style Analysis',
  },
};

export const INITIAL_SETTINGS: Settings = {
  aspectRatio: '9:16',
  lightingStyle: 'Cinematic',
  cameraPerspective: 'Wide Angle',
  prompt: '',
};

// This is no longer used for generation but kept for type structure.
export const INITIAL_STYLE: Style = {
  palette: [],
  typography: '',
  composition: '',
  vibe: '',
};

export const MOCK_POSTERS: Poster[] = [];