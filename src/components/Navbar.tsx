
"use client"

import React from 'react';
import Image from 'next/image';
import { Search, Menu, LayoutGrid, List, Settings, LogOut } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useAuth, useUser } from '@/firebase';
import { signOut } from 'firebase/auth';
import { ThemeSelector } from './ThemeSelector';
import { ModeToggle } from './ModeToggle';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useSidebar } from '@/components/ui/sidebar';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import bulbImg from '@/app/bulb.webp';

interface NavbarProps {
  onSearch: (val: string) => void;
  viewMode: 'grid' | 'list';
  onViewModeToggle: () => void;
  onOpenSettings: () => void;
}

export function Navbar({ onSearch, viewMode, onViewModeToggle, onOpenSettings }: NavbarProps) {
  const { user } = useUser();
  const auth = useAuth();
  const { toggleSidebar } = useSidebar();

  const handleSignOut = () => {
    signOut(auth);
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/80 backdrop-blur-md px-2 sm:px-4 h-16 flex items-center justify-between gap-2 overflow-hidden">
      <div className="flex items-center space-x-1 sm:space-x-4 shrink-0">
        <Button variant="ghost" size="icon" className="rounded-full h-9 w-9" onClick={toggleSidebar}>
          <Menu className="h-5 w-5" />
        </Button>
        <div className="flex items-center space-x-2">
          <div className="relative h-7 w-7 sm:h-8 sm:w-8 flex items-center justify-center">
            {/* Dark mode intense glow effect */}
            <div className="absolute inset-0 bg-primary/40 blur-2xl rounded-full opacity-0 dark:opacity-100 transition-opacity duration-700 scale-[2.2] pointer-events-none" />
            <div className="absolute inset-0 bg-primary/20 blur-md rounded-full opacity-0 dark:opacity-100 transition-opacity duration-500 scale-[1.5] pointer-events-none" />
            <Image 
              src={bulbImg} 
              alt="Personal Space Logo" 
              width={32} 
              height={32} 
              className="object-contain relative z-10"
              priority
            />
          </div>
          <span className="text-lg sm:text-xl font-headline font-semibold hidden lg:inline-block truncate">Personal Space</span>
        </div>
      </div>

      <div className="flex-1 max-w-xl mx-1 sm:mx-4 min-w-0">
        <div className="relative group">
          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
            <Search className="h-4 w-4 text-muted-foreground group-focus-within:text-foreground transition-colors" />
          </div>
          <Input 
            className="w-full bg-secondary border-none h-10 sm:h-11 pl-10 focus-visible:ring-0 focus-visible:bg-background focus-visible:google-shadow transition-all rounded-lg text-sm"
            placeholder="Search..."
            onChange={(e) => onSearch(e.target.value)}
          />
        </div>
      </div>

      <div className="flex items-center space-x-1 sm:space-x-2 shrink-0">
        <div className="flex items-center space-x-0.5 sm:space-x-1">
          <ModeToggle />
          <ThemeSelector />
        </div>
        
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button 
                variant="ghost" 
                size="icon" 
                className="rounded-full h-9 w-9 hidden sm:flex" 
                onClick={onViewModeToggle}
              >
                {viewMode === 'grid' ? <List className="h-5 w-5" /> : <LayoutGrid className="h-5 w-5" />}
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>{viewMode === 'grid' ? 'List view' : 'Grid view'}</p>
            </TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button 
                variant="ghost" 
                size="icon" 
                className="rounded-full h-9 w-9 hidden sm:flex"
                onClick={onOpenSettings}
              >
                <Settings className="h-5 w-5" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Settings</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
        
        {user && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="rounded-full ml-1 sm:ml-2 h-9 w-9 overflow-hidden">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={user.photoURL || undefined} />
                  <AvatarFallback>{user.email?.[0].toUpperCase()}</AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuItem className="text-xs text-muted-foreground truncate font-medium border-b pb-2 mb-1">
                {user.email}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleSignOut} className="text-destructive focus:text-destructive">
                <LogOut className="mr-2 h-4 w-4" />
                Sign Out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>
    </header>
  );
}
