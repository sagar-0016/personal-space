"use client"

import React from 'react';
import { useUser, useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { collection, doc } from 'firebase/firestore';
import { updateDocumentNonBlocking } from '@/firebase/non-blocking-updates';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Palette, Check, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function ThemeSelector() {
  const { user } = useUser();
  const db = useFirestore();

  const themesRef = useMemoFirebase(() => {
    if (!db) return null;
    return collection(db, 'themes');
  }, [db]);

  const { data: themes, isLoading } = useCollection(themesRef);

  const handleSelectTheme = (themeId: string) => {
    if (!db || !user) return;
    const userRef = doc(db, 'users', user.uid);
    updateDocumentNonBlocking(userRef, { preferredThemeId: themeId });
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="rounded-full">
          <Palette className="h-5 w-5" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuLabel>Choose Theme</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {isLoading ? (
          <div className="p-2 flex justify-center">
            <Loader2 className="h-4 w-4 animate-spin" />
          </div>
        ) : (themes || []).map((theme) => (
          <DropdownMenuItem 
            key={theme.id}
            onClick={() => handleSelectTheme(theme.id)}
            className="flex items-center justify-between"
          >
            <div className="flex items-center space-x-2">
              <div 
                className="h-3 w-3 rounded-full" 
                style={{ backgroundColor: `hsl(${theme.primary})` }} 
              />
              <span>{theme.name}</span>
            </div>
          </DropdownMenuItem>
        ))}
        {(themes || []).length === 0 && !isLoading && (
          <div className="p-2 text-xs text-muted-foreground text-center">
            No themes available
          </div>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
