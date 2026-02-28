"use client"

import { useEffect } from 'react';
import { useUser, useFirestore, useDoc, useMemoFirebase } from '@/firebase';
import { doc } from 'firebase/firestore';
import { Theme } from '@/lib/types';
import { useTheme } from 'next-themes';

const BUILTIN_THEMES: Theme[] = [
  {
    id: 'builtin-sky',
    name: 'Sky Blue',
    primary: '199 89% 48%',
    background: '0 0% 98%',
    accent: '199 89% 95%'
  },
  {
    id: 'builtin-emerald',
    name: 'Emerald Forest',
    primary: '142 71% 45%',
    background: '142 30% 98%',
    accent: '142 71% 95%'
  },
  {
    id: 'builtin-amethyst',
    name: 'Royal Purple',
    primary: '262 83% 58%',
    background: '262 30% 98%',
    accent: '262 83% 95%'
  },
  {
    id: 'builtin-amber',
    name: 'Golden Hour',
    primary: '38 92% 50%',
    background: '38 30% 98%',
    accent: '38 92% 95%'
  },
  {
    id: 'builtin-rose',
    name: 'Rose Quartz',
    primary: '330 81% 60%',
    background: '330 30% 98%',
    accent: '330 81% 95%'
  },
  {
    id: 'builtin-slate',
    name: 'Midnight Slate',
    primary: '222 47% 31%',
    background: '222 20% 98%',
    accent: '222 47% 95%'
  },
  {
    id: 'builtin-ocean',
    name: 'Oceanic Teal',
    primary: '174 75% 39%',
    background: '174 30% 98%',
    accent: '174 75% 95%'
  },
  {
    id: 'builtin-lava',
    name: 'Lava Red',
    primary: '0 72% 51%',
    background: '0 30% 98%',
    accent: '0 72% 95%'
  },
  {
    id: 'builtin-forest',
    name: 'Deep Forest',
    primary: '160 84% 39%',
    background: '160 30% 98%',
    accent: '160 84% 95%'
  },
  {
    id: 'builtin-midnight',
    name: 'Midnight Ink',
    primary: '221 83% 53%',
    background: '221 20% 98%',
    accent: '221 83% 95%'
  },
  {
    id: 'builtin-crimson',
    name: 'Crimson Peak',
    primary: '346 84% 50%',
    background: '346 20% 98%',
    accent: '346 84% 95%'
  }
];

export function ThemeSync() {
  const { user } = useUser();
  const db = useFirestore();
  const { resolvedTheme } = useTheme();

  const userProfileRef = useMemoFirebase(() => {
    if (!db || !user) return null;
    return doc(db, 'users', user.uid);
  }, [db, user]);

  const { data: profile } = useDoc(userProfileRef);

  const themeRef = useMemoFirebase(() => {
    if (!db || !profile?.preferredThemeId || profile.preferredThemeId.startsWith('builtin-')) return null;
    return doc(db, 'themes', profile.preferredThemeId);
  }, [db, profile?.preferredThemeId]);

  const { data: dbTheme } = useDoc<Theme>(themeRef);

  useEffect(() => {
    let activeTheme: Theme | undefined;

    if (profile?.preferredThemeId?.startsWith('builtin-')) {
      activeTheme = BUILTIN_THEMES.find(t => t.id === profile.preferredThemeId);
    } else if (dbTheme) {
      activeTheme = dbTheme;
    }

    const root = document.documentElement;
    const isDark = resolvedTheme === 'dark';
    const primaryColor = activeTheme?.primary || '199 89% 48%';

    if (activeTheme) {
      root.style.setProperty('--primary', primaryColor);
      
      if (isDark) {
        root.style.setProperty('--accent', `var(--primary) / 0.15`);
        root.style.removeProperty('--background');
      } else {
        root.style.setProperty('--background', activeTheme.background || '0 0% 98%');
        root.style.setProperty('--accent', activeTheme.accent || '199 89% 95%');
      }
    } else {
      root.style.removeProperty('--primary');
      root.style.removeProperty('--background');
      root.style.removeProperty('--accent');
    }

    // Dynamic Favicon Update matching theme color is removed to preserve main icon
  }, [profile?.preferredThemeId, dbTheme, resolvedTheme]);

  return null;
}
