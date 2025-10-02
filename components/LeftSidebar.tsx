import React, { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import type { Language, Poster } from '../types';
import { UI_TEXT } from '../constants';
import { UploadIcon, EditIcon, SparklesIcon, CloseIcon } from './icons/EditorIcons';
import { Button } from './ui/Button';
import { Spinner } from './ui/Spinner';

interface LeftSidebarProps {
  onProductImagesUpload: (files: File[]) => void;
  onStyleImageUpload: (file: File | null) => void;
  productImages: File[];
  styleImage: File | null;
  onRemoveProductImage: (index: number) => void;
  onRemoveStyleImage: () => void;
  language: Language;
  activePoster: Poster | null;
  editPrompt: string;
  onEditPromptChange: (prompt: string) => void;
  onApplyEdit: () => void;
  isLoading: boolean;
  isAnalyzingStyle: boolean;
}

const ImageDropzone: React.FC<{onDrop: (files: File[]) => void, title: string, isMultiple?: boolean}> = ({ onDrop, title, isMultiple = false }) => {
    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: { 'image/*': ['.jpeg', '.png', '.jpg', '.webp'] },
        multiple: isMultiple
    });

    return (
        <div {...getRootProps()}
            className={`p-4 border-2 border-dashed rounded-lg text-center cursor-pointer transition-colors ${
            isDragActive ? 'border-indigo-400 bg-gray-700/50' : 'border-gray-600 hover:border-gray-500'
            }`}
        >
            <input {...getInputProps()} />
            <UploadIcon className="w-6 h-6 mx-auto text-gray-500 mb-2" />
            <p className="text-xs text-gray-400">{title}</p>
        </div>
    );
};


export const LeftSidebar: React.FC<LeftSidebarProps> = (props) => {
  const { 
    onProductImagesUpload, onStyleImageUpload, productImages, styleImage, 
    onRemoveProductImage, onRemoveStyleImage, language,
    activePoster, editPrompt, onEditPromptChange, onApplyEdit, isLoading, isAnalyzingStyle
  } = props;
  const t = (key: string) => UI_TEXT[language][key] || key;

  const handleProductDrop = useCallback((acceptedFiles: File[]) => {
    onProductImagesUpload([...productImages, ...acceptedFiles]);
  }, [onProductImagesUpload, productImages]);

  const handleStyleDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
        onStyleImageUpload(acceptedFiles[0]);
    }
  }, [onStyleImageUpload]);

  return (
    <aside className="w-80 bg-gray-800 p-4 flex-shrink-0 flex flex-col space-y-6 overflow-y-auto">
      
      {activePoster && (
         <div>
            <h3 className="text-sm font-bold text-gray-400 uppercase mb-2 flex items-center">
                <EditIcon className="w-4 h-4 mr-2" />
                {t('editPoster')}
            </h3>
            <div className="space-y-3 p-3 bg-gray-900/50 rounded-lg">
                <textarea
                value={editPrompt}
                onChange={(e) => onEditPromptChange(e.target.value)}
                placeholder="e.g., 'Change background to a forest' or 'Make the lighting more dramatic'"
                className="w-full bg-gray-700 border border-gray-600 rounded-md p-2 text-sm text-gray-300 resize-none h-24 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
                <Button onClick={onApplyEdit} disabled={isLoading || !editPrompt} variant="secondary" className="w-full">
                    {isLoading ? t('applyingEdit') : (
                        <div className="flex items-center justify-center">
                            <SparklesIcon className="w-4 h-4 mr-2" />
                            {t('applyEdit')}
                        </div>
                    )}
                </Button>
            </div>
        </div>
      )}

      <div>
        <h3 className="text-sm font-bold text-gray-400 uppercase mb-2">{t('productImages')}</h3>
        <ImageDropzone onDrop={handleProductDrop} title="Drop product image(s) here" isMultiple={true} />
        {productImages.length > 0 && (
            <div className="grid grid-cols-4 gap-2 mt-2">
                {productImages.map((file, index) => (
                    <div key={index} className="relative group aspect-square rounded-md overflow-hidden ring-1 ring-gray-600">
                        <img src={URL.createObjectURL(file)} alt={file.name} className="w-full h-full object-cover" />
                        <button 
                            onClick={() => onRemoveProductImage(index)}
                            className="absolute top-1 right-1 bg-black/50 p-0.5 rounded-full text-white opacity-0 group-hover:opacity-100 transition-opacity"
                            aria-label="Remove image"
                        >
                            <CloseIcon className="w-3 h-3" />
                        </button>
                    </div>
                ))}
            </div>
        )}
      </div>

      <div>
        <h3 className="text-sm font-bold text-gray-400 uppercase mb-2">{t('styleReference')}</h3>
        <ImageDropzone onDrop={handleStyleDrop} title="Drop one style reference image" />
        {styleImage && (
            <div className="mt-2 relative group aspect-video rounded-md overflow-hidden ring-1 ring-gray-600">
                <img src={URL.createObjectURL(styleImage)} alt={styleImage.name} className="w-full h-full object-cover" />
                 {isAnalyzingStyle && (
                    <div className="absolute inset-0 bg-gray-900/70 flex flex-col items-center justify-center">
                        <Spinner className="w-6 h-6" />
                        <p className="text-xs text-indigo-300 mt-2">Analyzing Style...</p>
                    </div>
                 )}
                 {!isAnalyzingStyle && (
                    <button 
                        onClick={onRemoveStyleImage}
                        className="absolute top-1 right-1 bg-black/50 p-0.5 rounded-full text-white opacity-0 group-hover:opacity-100 transition-opacity"
                        aria-label="Remove style image"
                    >
                        <CloseIcon className="w-3 h-3" />
                    </button>
                 )}
            </div>
        )}
      </div>

    </aside>
  );
};
