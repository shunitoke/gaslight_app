'use client';

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';

interface AnimationContextType {
  animationsEnabled: boolean;
  isPageVisible: boolean;
  isProcessing: boolean; // uploading or analyzing
  setProcessing: (processing: boolean) => void;
  prefersReducedMotion: boolean;
}

const AnimationContext = createContext<AnimationContextType | undefined>(undefined);

export function AnimationProvider({ children }: { children: React.ReactNode }) {
  const [isPageVisible, setIsPageVisible] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  // Page Visibility API - выключаем анимации при смене вкладки
  useEffect(() => {
    const handleVisibilityChange = () => {
      setIsPageVisible(!document.hidden);
    };

    // Проверяем начальное состояние
    setIsPageVisible(!document.hidden);

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  // Проверяем prefers-reduced-motion
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);

    const handleChange = (e: MediaQueryListEvent) => {
      setPrefersReducedMotion(e.matches);
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => {
      mediaQuery.removeEventListener('change', handleChange);
    };
  }, []);

  // Анимации включены только если:
  // 1. Страница видима
  // 2. Не идет обработка (upload/analysis)
  // 3. Пользователь не предпочитает уменьшенную анимацию
  const animationsEnabled = isPageVisible && !isProcessing && !prefersReducedMotion;

  const setProcessing = useCallback((processing: boolean) => {
    setIsProcessing(processing);
  }, []);

  return (
    <AnimationContext.Provider
      value={{
        animationsEnabled,
        isPageVisible,
        isProcessing,
        setProcessing,
        prefersReducedMotion,
      }}
    >
      {children}
    </AnimationContext.Provider>
  );
}

export function useAnimation() {
  const context = useContext(AnimationContext);
  if (context === undefined) {
    throw new Error('useAnimation must be used within an AnimationProvider');
  }
  return context;
}


