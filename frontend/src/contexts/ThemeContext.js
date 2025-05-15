import React, { createContext, useState, useEffect, useCallback } from 'react';
import { applyThemeToDOM, getInitialTheme, themes } from '../utils/themeUtils';

export const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  const [currentTheme, setCurrentTheme] = useState(getInitialTheme());
  const [selectedPreviewTheme, setSelectedPreviewTheme] = useState(currentTheme);

  useEffect(() => {
    applyThemeToDOM(currentTheme);
  }, [currentTheme]);

  const applySelectedTheme = useCallback(() => {
    if (themes[selectedPreviewTheme]) {
      setCurrentTheme(selectedPreviewTheme);
      localStorage.setItem('selectedTheme', selectedPreviewTheme);
    } else {
      console.warn(`Attempted to apply an unknown theme: ${selectedPreviewTheme}`);
    }
  }, [selectedPreviewTheme]);

  const previewTheme = useCallback((themeName) => {
    const themeKey = themeName.toLowerCase(); 
    if (themes[themeKey]) {
      setSelectedPreviewTheme(themeKey);
    } else {
      console.warn(`Attempted to preview an unknown theme: ${themeKey}`);
    }
  }, []);

  const cancelPreviewTheme = useCallback(() => {
    setSelectedPreviewTheme(currentTheme);
  }, [currentTheme]);

  return (
    <ThemeContext.Provider value={{ 
      currentTheme, 
      selectedPreviewTheme,
      previewTheme,
      applySelectedTheme,
      cancelPreviewTheme,
      themes 
    }}>
      {children}
    </ThemeContext.Provider>
  );
};