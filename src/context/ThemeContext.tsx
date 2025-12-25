'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';

type Theme = 'light' | 'dark';

interface ThemeContextType {
    theme: Theme;
    toggleTheme: () => void;
    primaryColor: string;
    setPrimaryColor: (color: string) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
    const [theme, setTheme] = useState<Theme>('light');
    const [primaryColor, setPrimaryColorState] = useState('#F97316'); // Default Orange

    useEffect(() => {
        // Load from LocalStorage
        const savedTheme = localStorage.getItem('theme') as Theme;
        if (savedTheme) {
            setTheme(savedTheme);
            document.documentElement.setAttribute('data-theme', savedTheme);
        }

        const savedColor = localStorage.getItem('primaryColor');
        if (savedColor) {
            setPrimaryColorState(savedColor);
            document.documentElement.style.setProperty('--primary', savedColor);
        }
    }, []);

    const toggleTheme = () => {
        const newTheme = theme === 'light' ? 'dark' : 'light';
        setTheme(newTheme);
        localStorage.setItem('theme', newTheme);
        document.documentElement.setAttribute('data-theme', newTheme);
    };

    const setPrimaryColor = (color: string) => {
        setPrimaryColorState(color);
        localStorage.setItem('primaryColor', color);
        document.documentElement.style.setProperty('--primary', color);
    };

    return (
        <ThemeContext.Provider value={{ theme, toggleTheme, primaryColor, setPrimaryColor }}>
            {children}
        </ThemeContext.Provider>
    );
}

export function useTheme() {
    const context = useContext(ThemeContext);
    if (context === undefined) {
        throw new Error('useTheme must be used within a ThemeProvider');
    }
    return context;
}
