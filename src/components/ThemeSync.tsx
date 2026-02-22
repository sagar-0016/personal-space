
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

    if (activeTheme) {
      const root = document.documentElement;
      const isDark = resolvedTheme === 'dark';

      // Always apply primary and accent
      root.style.setProperty('--primary', activeTheme.primary || '199 89% 48%');
      
      // If we are in dark mode, we use the global dark background instead of the theme background
      // but we update the accent to be more dark-mode friendly
      if (isDark) {
        root.style.setProperty('--accent', `var(--primary) / 0.15`);
        // We don't override --background in dark mode to keep it deep black/gray
      } else {
        root.style.setProperty('--background', activeTheme.background || '0 0% 98%');
        root.style.setProperty('--accent', activeTheme.accent || '199 89% 95%');
      }
    }
  }, [profile?.preferredThemeId, dbTheme, resolvedTheme]);

  return null;
}
