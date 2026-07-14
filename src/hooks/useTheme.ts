import * as React from 'react';
import type { ThemeProviderContext } from '@/types/theme';

const ThemeProviderContext = React.createContext<ThemeProviderContext | null>(null);

export function useTheme() {
  const context = React.useContext(ThemeProviderContext);

  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }

  return context;
}

export { ThemeProviderContext };
