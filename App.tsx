import React, { useState, useEffect, useCallback } from 'react';
import { Header } from './components/Header';
import { LeftSidebar } from './components/LeftSidebar';
import { CenterCanvas } from './components/CenterCanvas';
import { RightSidebar } from './components/RightSidebar';
import { BottomLibrary } from './components/BottomLibrary';
import type { Language, Poster, Settings, StyleAnalysis } from './types';
import { INITIAL_SETTINGS } from './constants';
import * as geminiService from './services/geminiService';

const App: React.FC = () => {
  const [language] = useState<Language>('en');
  const [posters, setPosters] = useState<Poster[]>([]);
  const [activePoster, setActivePoster] = useState<Poster | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const [settings, setSettings] = useState<Settings>(INITIAL_SETTINGS);
  const [productImages, setProductImages] = useState<File[]>([]);
  const [styleImage, setStyleImage] = useState<File | null>(null);
  const [styleAnalysis, setStyleAnalysis] = useState<StyleAnalysis | null>(null);
  
  const [creativeConcept, setCreativeConcept] = useState('');
  const [editPrompt, setEditPrompt] = useState('');
  const [promptSuggestions, setPromptSuggestions] = useState<string[]>([]);

  // When a poster is selected from the library, load its prompt into the editor
  useEffect(() => {
    if (activePoster) {
      setSettings(s => ({ ...s, prompt: activePoster.prompt }));
      setCreativeConcept(activePoster.prompt);
    }
  }, [activePoster]);


  const urlToBase64 = async (url: string): Promise<string> => {
    const response = await fetch(url);
    const blob = await response.blob();
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve((reader.result as string).split(',')[1]);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  };

  const handleStyleImageUpload = useCallback(async (file: File | null) => {
    setStyleImage(file);
    if (file) {
      setIsAnalyzing(true);
      setStyleAnalysis(null);
      try {
        const analysis = await geminiService.analyzeStyleReference(file);
        setStyleAnalysis(analysis);
      } catch (error) {
        console.error("Error analyzing style:", error);
        alert("Failed to analyze style reference. Check console for details.");
      } finally {
        setIsAnalyzing(false);
      }
    } else {
      setStyleAnalysis(null);
    }
  }, []);

  const generateAndSetPoster = useCallback(async () => {
    if (productImages.length === 0 || !styleImage || !styleAnalysis) {
      alert("Please upload product and style images, and wait for analysis to complete.");
      return;
    }
    setIsLoading(true);
    setLoadingMessage('Generating poster from reference...');
    try {
      const { imageUrl, masterPrompt } = await geminiService.generatePosterFromReference(productImages, styleImage, styleAnalysis, settings);
      const newPoster: Poster = {
        id: `poster-${Date.now()}`,
        name: masterPrompt.substring(0, 30) || 'New Poster',
        url: imageUrl,
        prompt: masterPrompt,
      };
      setCreativeConcept(masterPrompt);
      // Populate the main prompt with the new master prompt
      setSettings(s => ({...s, prompt: masterPrompt}));
      setPosters(prev => [...prev, newPoster]);
      setActivePoster(newPoster);
      // Automatically get new suggestions based on the new poster
      handleGetSuggestions();
    } catch (error) {
      console.error("Error generating poster:", error);
      alert("Failed to generate poster. Check the console for details.");
    } finally {
      setIsLoading(false);
      setLoadingMessage('');
    }
  }, [productImages, styleImage, styleAnalysis, settings]);

  const handleGetSuggestions = useCallback(async () => {
    if (productImages.length === 0 || !styleImage) return;
    try {
        const suggestions = await geminiService.generatePromptSuggestions(productImages, styleImage);
        setPromptSuggestions(suggestions);
    } catch (error) {
        console.error("Failed to get prompt suggestions:", error);
    }
  }, [productImages, styleImage]);

  // Automatic generation on first upload
  useEffect(() => {
    if (productImages.length > 0 && styleImage && styleAnalysis && posters.length === 0) {
      generateAndSetPoster();
    }
  }, [productImages, styleImage, styleAnalysis, posters.length, generateAndSetPoster]);

  const handleApplyEdit = async () => {
    if (!activePoster || !editPrompt) {
        alert("Please select a poster and provide an edit instruction.");
        return;
    }
    setIsLoading(true);
    setLoadingMessage(`Applying edit: "${editPrompt}"...`);
    try {
        const base64Image = await urlToBase64(activePoster.url);
        const editedImageUrl = await geminiService.editPoster(base64Image, editPrompt);
        
        const updatedPoster = { ...activePoster, url: editedImageUrl, id: `poster-${Date.now()}`, prompt: `EDIT: ${editPrompt}\n\n${activePoster.prompt}` };
        
        // Add as a new version in the library
        setPosters(prev => [...prev, updatedPoster]);
        setActivePoster(updatedPoster);
        setEditPrompt('');

    } catch (error) {
        console.error("Error applying edit:", error);
        alert("Failed to apply edit. Check the console for details.");
    } finally {
        setIsLoading(false);
        setLoadingMessage('');
    }
  };

  const handleRemoveProductImage = (indexToRemove: number) => {
    setProductImages(prev => prev.filter((_, index) => index !== indexToRemove));
  };
  
  const handleRemoveStyleImage = () => {
    handleStyleImageUpload(null);
  };


  return (
    <div className="h-screen w-screen bg-gray-900 text-white flex flex-col font-sans antialiased">
      <Header language={language} />
      <main className="flex-grow flex overflow-hidden">
        <LeftSidebar 
            onProductImagesUpload={setProductImages}
            onStyleImageUpload={handleStyleImageUpload}
            productImages={productImages}
            styleImage={styleImage}
            onRemoveProductImage={handleRemoveProductImage}
            onRemoveStyleImage={handleRemoveStyleImage}
            language={language}
            activePoster={activePoster}
            onApplyEdit={handleApplyEdit}
            editPrompt={editPrompt}
            onEditPromptChange={setEditPrompt}
            isLoading={isLoading}
            isAnalyzingStyle={isAnalyzing}
        />
        <div className="flex-grow flex flex-col">
          <CenterCanvas 
            activePoster={activePoster} 
            isLoading={isLoading} 
            loadingMessage={loadingMessage} 
            language={language}
          />
          <BottomLibrary 
            posters={posters} 
            onSelectPoster={setActivePoster} 
            activePosterId={activePoster?.id}
            language={language}
          />
        </div>
        <RightSidebar 
            settings={settings}
            onSettingsChange={setSettings}
            onGenerate={generateAndSetPoster}
            creativeConcept={creativeConcept}
            isLoading={isLoading}
            language={language}
            hasUploadedContent={productImages.length > 0 && !!styleImage}
            promptSuggestions={promptSuggestions}
            onGetSuggestions={handleGetSuggestions}
            styleAnalysis={styleAnalysis}
        />
      </main>
    </div>
  );
};

export default App;
