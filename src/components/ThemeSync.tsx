"use client"

import { useEffect } from 'react';
import { useUser, useFirestore, useDoc, useMemoFirebase } from '@/firebase';
import { doc } from 'firebase/firestore';

export function ThemeSync() {
  const { user } = useUser();
  const db = useFirestore();

  // 1. Get user profile to find preferredThemeId
  const userProfileRef = useMemoFirebase(() => {
    if (!db || !user) return null;
    return doc(db, 'users', user.uid);
  }, [db, user]);

  const { data: profile } = useDoc(userProfileRef);

  // 2. Fetch the actual theme document
  const themeRef = useMemoFirebase(() => {
    if (!db || !profile?.preferredThemeId) return null;
    return doc(db, 'themes', profile.preferredThemeId);
  }, [db, profile?.preferredThemeId]);

  const { data: theme } = useDoc(themeRef);

  useEffect(() => {
    if (theme) {
      const root = document.documentElement;
      root.style.setProperty('--primary', theme.primary || '199 68% 77%');
      root.style.setProperty('--background', theme.background || '0 0% 96%');
      root.style.setProperty('--accent', theme.accent || '142 40% 65%');
    }
  }, [theme]);

  return null;
}
