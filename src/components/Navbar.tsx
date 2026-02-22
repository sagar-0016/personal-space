"use client"

import React from 'react';
import { Search, Menu, RotateCcw, LayoutGrid, Settings, User } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

export function Navbar({ onSearch }: { onSearch: (val: string) => void }) {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/80 backdrop-blur-md px-4 h-16 flex items-center justify-between">
      <div className="flex items-center space-x-4">
        <Button variant="ghost" size="icon" className="rounded-full">
          <Menu className="h-5 w-5" />
        </Button>
        <div className="flex items-center space-x-2">
          <div className="h-8 w-8 bg-primary rounded-lg flex items-center justify-center">
            <RotateCcw className="h-5 w-5 text-primary-foreground" />
          </div>
          <span className="text-xl font-headline font-semibold hidden sm:inline-block">NoteWave</span>
        </div>
      </div>

      <div className="flex-1 max-w-2xl mx-4">
        <div className="relative group">
          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
            <Search className="h-4 w-4 text-muted-foreground group-focus-within:text-foreground transition-colors" />
          </div>
          <Input 
            className="w-full bg-secondary border-none h-11 pl-10 focus-visible:ring-0 focus-visible:bg-background focus-visible:google-shadow transition-all rounded-lg"
            placeholder="Search notes..."
            onChange={(e) => onSearch(e.target.value)}
          />
        </div>
      </div>

      <div className="flex items-center space-x-2">
        <Button variant="ghost" size="icon" className="rounded-full hidden sm:flex">
          <RotateCcw className="h-5 w-5" />
        </Button>
        <Button variant="ghost" size="icon" className="rounded-full hidden sm:flex">
          <LayoutGrid className="h-5 w-5" />
        </Button>
        <Button variant="ghost" size="icon" className="rounded-full">
          <Settings className="h-5 w-5" />
        </Button>
        <Button variant="ghost" size="icon" className="rounded-full ml-2">
          <User className="h-5 w-5" />
        </Button>
      </div>
    </header>
  );
}