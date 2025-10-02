export type Language = 'en';

export interface Poster {
  id: string;
  name: string;
  url: string;
  /** Stores the full, detailed master prompt used to generate this poster. */
  prompt: string;
  metadata?: Record<string, any>;
}

export interface Settings {
  aspectRatio: '9:16' | '1:1' | '16:9' | '3:4' | '4:3';
  lightingStyle: 'Cinematic' | 'Studio' | 'Dramatic' | 'Natural' | 'Vibrant';
  cameraPerspective: 'Wide Angle' | 'Close Up' | 'Top Down' | 'Dynamic';
  prompt: string;
}

export interface StyleAnalysis {
  palette: string[];
  lighting: string;
  composition: string;
  textures: string[];
  vibe: string;
  keywords: string[];
}


export interface Style {
  palette: string[];
  typography: string;
  composition: string;
  vibe: string;
}
