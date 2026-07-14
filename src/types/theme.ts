import * as React from 'react';

export type Theme = 'dark' | 'light' | 'system';
export type ResolvedTheme = 'dark' | 'light';

export type ThemeProviderProps = {
  children: React.ReactNode
  defaultTheme?: Theme
  storageKey?: string
  disableTransitionOnChange?: boolean
}

export type ThemeProviderContext = {
  theme: Theme
  resolvedTheme: ResolvedTheme
  setTheme: (theme: Theme) => void
}

export const COLOR_SCHEME_QUERY = '(prefers-color-scheme: dark)';
export const THEME_VALUES: Theme[] = ['light', 'dark', 'system'];