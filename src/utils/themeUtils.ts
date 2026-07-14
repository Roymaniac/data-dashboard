import type { Theme, ResolvedTheme } from '../types/theme';
import { COLOR_SCHEME_QUERY, THEME_VALUES } from '../types/theme';

export function isTheme(value: string | null | undefined): value is Theme {
  if (!value) return false;
  return THEME_VALUES.includes(value as Theme);
}

export function getSystemTheme(): ResolvedTheme {
  if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') {
    return 'light';
  }

  return window.matchMedia(COLOR_SCHEME_QUERY).matches ? 'dark' : 'light';
}

export function resolveTheme(theme: Theme): ResolvedTheme {
  return theme === 'system' ? getSystemTheme() : theme;
}

export function applyThemeToDocument(theme: ResolvedTheme, disableTransitionOnChange = true) {
  const root = window.document.documentElement;

  if (disableTransitionOnChange) {
    const style = document.createElement('style');
    style.textContent = `*, *::before, *::after { -webkit-transition: none !important; -moz-transition: none !important; -o-transition: none !important; -ms-transition: none !important; transition: none !important; }`;
    document.head.appendChild(style);

    window.requestAnimationFrame(() => {
      window.requestAnimationFrame(() => style.remove());
    });
  }

  root.classList.remove('light', 'dark');
  root.classList.add(theme);
}

export function isEditableTarget(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false;
  if (target.isContentEditable) return true;

  return target.closest('input, textarea, [contenteditable="true"]') !== null;
}

export function getNextTheme(currentTheme: Theme): Theme {
  if (currentTheme === 'dark') return 'light';
  if (currentTheme === 'light') return 'dark';

  return getSystemTheme() === 'dark' ? 'light' : 'dark';
}
