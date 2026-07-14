import * as React from 'react';
import type { Theme, ThemeProviderProps, ThemeProviderContext as ThemeProviderContextType } from '../types/theme';
import { COLOR_SCHEME_QUERY } from '../types/theme';
import {
    applyThemeToDocument,
    getNextTheme,
    isEditableTarget,
    isTheme,
    resolveTheme,
} from '../utils/themeUtils';
import { ThemeProviderContext as ThemeContext } from '../hooks/useTheme';

export function ThemeProvider({
    children,
    defaultTheme = 'system',
    storageKey = 'theme',
    disableTransitionOnChange = true,
}: ThemeProviderProps) {
    const [theme, setThemeState] = React.useState<Theme>(() => {
        if (typeof window === 'undefined') return defaultTheme;

        const storedTheme = window.localStorage.getItem(storageKey);
        return storedTheme && isTheme(storedTheme) ? storedTheme : defaultTheme;
    });

    const setTheme = React.useCallback(
        (nextTheme: Theme) => {
            setThemeState(nextTheme);
            window.localStorage.setItem(storageKey, nextTheme);
        },
        [storageKey],
    );

    const applyTheme = React.useCallback(
        (nextTheme: Theme) => {
            applyThemeToDocument(resolveTheme(nextTheme), disableTransitionOnChange);
        },
        [disableTransitionOnChange],
    );

    React.useEffect(() => {
        applyTheme(theme);

        if (theme !== 'system') return undefined;

        const mediaQuery = window.matchMedia(COLOR_SCHEME_QUERY);
        const handleChange = () => applyTheme('system');

        mediaQuery.addEventListener('change', handleChange);
        return () => mediaQuery.removeEventListener('change', handleChange);
    }, [applyTheme, theme]);

    React.useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.repeat || event.metaKey || event.ctrlKey || event.altKey) return;
            if (isEditableTarget(event.target)) return;
            if (event.key.toLowerCase() !== 'd') return;

            setThemeState((currentTheme) => {
                const nextTheme = getNextTheme(currentTheme);
                window.localStorage.setItem(storageKey, nextTheme);
                return nextTheme;
            });
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [storageKey]);

    React.useEffect(() => {
        const handleStorageChange = (event: StorageEvent) => {
            if (event.storageArea !== window.localStorage || event.key !== storageKey) return;
            setThemeState(isTheme(event.newValue) ? event.newValue : defaultTheme);
        };

        window.addEventListener('storage', handleStorageChange);
        return () => window.removeEventListener('storage', handleStorageChange);
    }, [defaultTheme, storageKey]);

    const value = React.useMemo<ThemeProviderContextType>(() => ({
        theme,
        resolvedTheme: resolveTheme(theme),
        setTheme,
    }), [setTheme, theme]);

    return (
        <ThemeContext.Provider value={value}>
            {children}
        </ThemeContext.Provider>
    );
}

