
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
import { Palette, Check, Loader2, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export function ThemeSelector() {
  const { user } = useUser();
  const db = useFirestore();

  const themesRef = useMemoFirebase(() => {
    if (!db) return null;
    return collection(db, 'themes');
  }, [db]);

  const { data: themes, isLoading } = useCollection(themesRef);

  // 1. Get user profile to find preferredThemeId for "Check" icon
  const userProfileRef = useMemoFirebase(() => {
    if (!db || !user) return null;
    return doc(db, 'users', user.uid);
  }, [db, user]);
  const { data: profile } = useDoc(userProfileRef);

  const handleSelectTheme = (themeId: string) => {
    if (!db || !user) return;
    const userRef = doc(db, 'users', user.uid);
    updateDocumentNonBlocking(userRef, { preferredThemeId: themeId });
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="rounded-full hover:bg-primary/10 transition-colors">
          <Palette className="h-5 w-5 text-primary" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56 p-2 rounded-xl border-none google-shadow">
        <DropdownMenuLabel className="flex items-center gap-2 text-muted-foreground font-medium">
          <Sparkles className="h-4 w-4 text-primary" />
          Choose Workspace Theme
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        {isLoading ? (
          <div className="p-4 flex justify-center">
            <Loader2 className="h-5 w-5 animate-spin text-primary" />
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-1">
            {(themes || []).map((theme) => {
              const isActive = profile?.preferredThemeId === theme.id;
              return (
                <DropdownMenuItem 
                  key={theme.id}
                  onClick={() => handleSelectTheme(theme.id)}
                  className={cn(
                    "flex items-center justify-between p-2 rounded-lg transition-all cursor-pointer",
                    isActive ? "bg-primary/10" : "hover:bg-secondary"
                  )}
                >
                  <div className="flex items-center space-x-3">
                    <div 
                      className="h-4 w-4 rounded-full border border-black/5 shadow-inner" 
                      style={{ backgroundColor: `hsl(${theme.primary})` }} 
                    />
                    <span className={cn("text-sm", isActive ? "font-bold text-primary" : "font-medium")}>
                      {theme.name}
                    </span>
                  </div>
                  {isActive && <Check className="h-4 w-4 text-primary" />}
                </DropdownMenuItem>
              );
            })}
          </div>
        )}
        {(themes || []).length === 0 && !isLoading && (
          <div className="p-4 text-xs text-muted-foreground text-center italic">
            No themes found. Connect to Firestore to add some!
          </div>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

// Re-importing useDoc as it was missing in the component logic but referenced
import { useDoc } from '@/firebase';
