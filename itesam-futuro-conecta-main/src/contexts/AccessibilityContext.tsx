import React, { createContext, useContext, useState, useEffect } from 'react';

export interface AccessibilitySettings {
  // Conteúdo
  fontSize: number;
  fontFamily: 'default' | 'dyslexic' | 'arial' | 'verdana';
  textAlign: 'left' | 'center' | 'justify';
  lineHeight: number;
  letterSpacing: number;
  hideImages: boolean;
  
  // Cor e tela
  textContrast: number;
  pageContrast: number;
  colorIntensity: number;
  colorScheme: 'default' | 'dark' | 'sepia' | 'high-contrast';
  
  // Navegação
  screenReader: boolean;
  showStructure: boolean;
  stopAnimations: boolean;
  muteAudio: boolean;
  highlightElements: boolean;
  
  // Legacy (mantido para compatibilidade)
  boldText: boolean;
  highContrast: boolean;
  reduceMotion: boolean;
  easyReading: boolean;
}

interface AccessibilityContextType {
  settings: AccessibilitySettings;
  // Font size
  increaseFontSize: () => void;
  decreaseFontSize: () => void;
  // Conteúdo
  setFontFamily: (family: AccessibilitySettings['fontFamily']) => void;
  setTextAlign: (align: AccessibilitySettings['textAlign']) => void;
  increaseLineHeight: () => void;
  decreaseLineHeight: () => void;
  increaseLetterSpacing: () => void;
  decreaseLetterSpacing: () => void;
  toggleHideImages: () => void;
  // Cor e tela
  increaseTextContrast: () => void;
  decreaseTextContrast: () => void;
  increasePageContrast: () => void;
  decreasePageContrast: () => void;
  increaseColorIntensity: () => void;
  decreaseColorIntensity: () => void;
  setColorScheme: (scheme: AccessibilitySettings['colorScheme']) => void;
  // Navegação
  toggleScreenReader: () => void;
  toggleShowStructure: () => void;
  toggleStopAnimations: () => void;
  toggleMuteAudio: () => void;
  toggleHighlightElements: () => void;
  // Legacy
  toggleBoldText: () => void;
  toggleHighContrast: () => void;
  toggleReduceMotion: () => void;
  toggleEasyReading: () => void;
  resetSettings: () => void;
}

const AccessibilityContext = createContext<AccessibilityContextType | undefined>(undefined);

const defaultSettings: AccessibilitySettings = {
  // Conteúdo
  fontSize: 100,
  fontFamily: 'default',
  textAlign: 'left',
  lineHeight: 100,
  letterSpacing: 100,
  hideImages: false,
  
  // Cor e tela
  textContrast: 100,
  pageContrast: 100,
  colorIntensity: 100,
  colorScheme: 'default',
  
  // Navegação
  screenReader: false,
  showStructure: false,
  stopAnimations: false,
  muteAudio: false,
  highlightElements: false,
  
  // Legacy
  boldText: false,
  highContrast: false,
  reduceMotion: false,
  easyReading: false,
};

export const AccessibilityProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [settings, setSettings] = useState<AccessibilitySettings>(() => {
    const stored = localStorage.getItem('accessibility-settings');
    return stored ? JSON.parse(stored) : defaultSettings;
  });

  useEffect(() => {
    localStorage.setItem('accessibility-settings', JSON.stringify(settings));
    applySettings(settings);
  }, [settings]);

  const applyMuteSetting = (mute: boolean) => {
    document.querySelectorAll('video, audio').forEach((el: HTMLMediaElement) => {
      el.muted = mute;
    });
  };

  const applySettings = (settings: AccessibilitySettings) => {
    const root = document.documentElement;
    const body = document.body;

    // Font size
    root.style.fontSize = `${settings.fontSize}%`;
    
    // Font family - only apply class if not default
    const fontFamily = 
      settings.fontFamily === 'dyslexic' ? 'OpenDyslexic, Arial, sans-serif' :
      settings.fontFamily === 'arial' ? 'Arial, sans-serif' :
      settings.fontFamily === 'verdana' ? 'Verdana, sans-serif' : '';
    
    root.style.setProperty('--accessibility-font-family', fontFamily);
    body.classList.toggle('accessibility-font-active', settings.fontFamily !== 'default');
    
    // Text align - only apply class if not left
    root.style.setProperty('--accessibility-text-align', settings.textAlign);
    body.classList.toggle('accessibility-align-active', settings.textAlign !== 'left');
    
    // Line height - only apply class if not 100%
    root.style.setProperty('--accessibility-line-height', `${settings.lineHeight}`);
    body.classList.toggle('accessibility-lineheight-active', settings.lineHeight !== 100);
    
    // Letter spacing - only apply class if not 100%
    root.style.setProperty('--accessibility-letter-spacing', `${(settings.letterSpacing - 100) / 100}em`);
    body.classList.toggle('accessibility-letterspacing-active', settings.letterSpacing !== 100);
    
    // Text contrast
    root.style.setProperty('--accessibility-text-contrast', `${settings.textContrast}%`);
    
    // Page contrast and color intensity - only apply class if values differ from defaults
    root.style.setProperty('--accessibility-page-contrast', `${settings.pageContrast}%`);
    root.style.setProperty('--accessibility-color-intensity', `${settings.colorIntensity}%`);
    root.classList.toggle('accessibility-filters-active', 
      settings.pageContrast !== 100 || settings.colorIntensity !== 100
    );

    // Hide images
    root.classList.toggle('accessibility-hide-images', settings.hideImages);
    
    // Color schemes
    root.classList.toggle('accessibility-dark', settings.colorScheme === 'dark');
    root.classList.toggle('accessibility-sepia', settings.colorScheme === 'sepia');
    root.classList.toggle('accessibility-high-contrast-scheme', settings.colorScheme === 'high-contrast');
    
    // Show structure
    root.classList.toggle('accessibility-show-structure', settings.showStructure);
    
    // Stop animations
    root.classList.toggle('accessibility-stop-animations', settings.stopAnimations);
    
    // Mute audio
    applyMuteSetting(settings.muteAudio);
    
    // Highlight elements
    root.classList.toggle('accessibility-highlight-elements', settings.highlightElements);

    // Legacy - Bold text
    root.classList.toggle('accessibility-bold', settings.boldText);

    // Legacy - High contrast
    root.classList.toggle('accessibility-high-contrast', settings.highContrast);

    // Legacy - Reduce motion
    root.classList.toggle('accessibility-reduce-motion', settings.reduceMotion);

    // Legacy - Easy reading
    root.classList.toggle('accessibility-easy-reading', settings.easyReading);
  };

  // Font size
  const increaseFontSize = () => {
    setSettings(prev => ({
      ...prev,
      fontSize: Math.min(prev.fontSize + 10, 150),
    }));
  };

  const decreaseFontSize = () => {
    setSettings(prev => ({
      ...prev,
      fontSize: Math.max(prev.fontSize - 10, 80),
    }));
  };
  
  // Conteúdo
  const setFontFamily = (family: AccessibilitySettings['fontFamily']) => {
    setSettings(prev => ({ ...prev, fontFamily: family }));
  };
  
  const setTextAlign = (align: AccessibilitySettings['textAlign']) => {
    setSettings(prev => ({ ...prev, textAlign: align }));
  };
  
  const increaseLineHeight = () => {
    setSettings(prev => ({
      ...prev,
      lineHeight: Math.min(prev.lineHeight + 10, 200),
    }));
  };
  
  const decreaseLineHeight = () => {
    setSettings(prev => ({
      ...prev,
      lineHeight: Math.max(prev.lineHeight - 10, 80),
    }));
  };
  
  const increaseLetterSpacing = () => {
    setSettings(prev => ({
      ...prev,
      letterSpacing: Math.min(prev.letterSpacing + 10, 150),
    }));
  };
  
  const decreaseLetterSpacing = () => {
    setSettings(prev => ({
      ...prev,
      letterSpacing: Math.max(prev.letterSpacing - 10, 80),
    }));
  };
  
  const toggleHideImages = () => {
    setSettings(prev => ({ ...prev, hideImages: !prev.hideImages }));
  };
  
  // Cor e tela
  const increaseTextContrast = () => {
    setSettings(prev => ({
      ...prev,
      textContrast: Math.min(prev.textContrast + 10, 200),
    }));
  };
  
  const decreaseTextContrast = () => {
    setSettings(prev => ({
      ...prev,
      textContrast: Math.max(prev.textContrast - 10, 50),
    }));
  };
  
  const increasePageContrast = () => {
    setSettings(prev => ({
      ...prev,
      pageContrast: Math.min(prev.pageContrast + 10, 200),
    }));
  };
  
  const decreasePageContrast = () => {
    setSettings(prev => ({
      ...prev,
      pageContrast: Math.max(prev.pageContrast - 10, 50),
    }));
  };
  
  const increaseColorIntensity = () => {
    setSettings(prev => ({
      ...prev,
      colorIntensity: Math.min(prev.colorIntensity + 10, 150),
    }));
  };
  
  const decreaseColorIntensity = () => {
    setSettings(prev => ({
      ...prev,
      colorIntensity: Math.max(prev.colorIntensity - 10, 50),
    }));
  };
  
  const setColorScheme = (scheme: AccessibilitySettings['colorScheme']) => {
    setSettings(prev => ({ ...prev, colorScheme: scheme }));
  };
  
  // Navegação
  const toggleScreenReader = () => {
    setSettings(prev => ({ ...prev, screenReader: !prev.screenReader }));
    // Aqui poderia integrar com uma API de screen reader
  };
  
  const toggleShowStructure = () => {
    setSettings(prev => ({ ...prev, showStructure: !prev.showStructure }));
  };
  
  const toggleStopAnimations = () => {
    setSettings(prev => ({ ...prev, stopAnimations: !prev.stopAnimations }));
  };
  
  const toggleMuteAudio = () => {
    setSettings(prev => ({ ...prev, muteAudio: !prev.muteAudio }));
  };
  
  const toggleHighlightElements = () => {
    setSettings(prev => ({ ...prev, highlightElements: !prev.highlightElements }));
  };

  // Legacy
  const toggleBoldText = () => {
    setSettings(prev => ({ ...prev, boldText: !prev.boldText }));
  };

  const toggleHighContrast = () => {
    setSettings(prev => ({ ...prev, highContrast: !prev.highContrast }));
  };

  const toggleReduceMotion = () => {
    setSettings(prev => ({ ...prev, reduceMotion: !prev.reduceMotion }));
  };

  const toggleEasyReading = () => {
    setSettings(prev => ({ ...prev, easyReading: !prev.easyReading }));
  };

  const resetSettings = () => {
    setSettings(defaultSettings);
  };

  return (
    <AccessibilityContext.Provider
      value={{
        settings,
        increaseFontSize,
        decreaseFontSize,
        setFontFamily,
        setTextAlign,
        increaseLineHeight,
        decreaseLineHeight,
        increaseLetterSpacing,
        decreaseLetterSpacing,
        toggleHideImages,
        increaseTextContrast,
        decreaseTextContrast,
        increasePageContrast,
        decreasePageContrast,
        increaseColorIntensity,
        decreaseColorIntensity,
        setColorScheme,
        toggleScreenReader,
        toggleShowStructure,
        toggleStopAnimations,
        toggleMuteAudio,
        toggleHighlightElements,
        toggleBoldText,
        toggleHighContrast,
        toggleReduceMotion,
        toggleEasyReading,
        resetSettings,
      }}
    >
      {children}
    </AccessibilityContext.Provider>
  );
};

export const useAccessibility = () => {
  const context = useContext(AccessibilityContext);
  if (!context) {
    throw new Error('useAccessibility must be used within AccessibilityProvider');
  }
  return context;
};
