'use client';

import * as React from 'react';

type ThemeProviderProps = {
  children: React.ReactNode;
  attribute?: string;
  defaultTheme?: 'dark' | 'light' | 'system';
  enableSystem?: boolean;
  disableTransitionOnChange?: boolean;
};

export function ThemeProvider({ children }: ThemeProviderProps) {
  return <>{children}</>;
} 