
"use client"

import React from 'react';
import { 
  Lightbulb, 
  Tag, 
  Archive, 
  Trash2,
  Layers,
  TagIcon
} from 'lucide-react';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar";
import { cn } from '@/lib/utils';

interface AppSidebarProps {
  currentView: string;
  onViewChange: (view: string) => void;
  labels: string[];
}

export function AppSidebar({ currentView, onViewChange, labels }: AppSidebarProps) {
  return (
    <Sidebar collapsible="icon" className="border-r-0 pt-16 bg-transparent">
      <SidebarContent className="bg-transparent">
        <SidebarGroup>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton 
                tooltip="All Notes" 
                isActive={currentView === 'all'}
                onClick={() => onViewChange('all')}
                className={cn(
                  "rounded-r-full mr-2 transition-all duration-300",
                  currentView === 'all' && "bg-primary/15 text-primary font-bold shadow-sm"
                )}
              >
                <Layers className={cn(currentView === 'all' && "text-primary")} />
                <span>All Notes</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel className="px-6 text-[10px] uppercase tracking-widest font-black opacity-60 text-primary">Labels</SidebarGroupLabel>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton 
                tooltip="Untagged" 
                isActive={currentView === 'untagged'}
                onClick={() => onViewChange('untagged')}
                className={cn(
                  "rounded-r-full mr-2 transition-all duration-300",
                  currentView === 'untagged' && "bg-primary/15 text-primary font-bold shadow-sm"
                )}
              >
                <TagIcon className={cn("h-4 w-4", currentView === 'untagged' && "text-primary")} />
                <span>Untagged</span>
              </SidebarMenuButton>
            </SidebarMenuItem>

            {labels.map((label) => (
              <SidebarMenuItem key={label}>
                <SidebarMenuButton 
                  tooltip={label} 
                  isActive={currentView === `label:${label}`}
                  onClick={() => onViewChange(`label:${label}`)}
                  className={cn(
                    "rounded-r-full mr-2 transition-all duration-300",
                    currentView === `label:${label}` && "bg-primary/15 text-primary font-bold shadow-sm"
                  )}
                >
                  <Tag className={cn("h-4 w-4", currentView === `label:${label}` && "text-primary")} />
                  <span>{label}</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton 
                tooltip="Archive" 
                isActive={currentView === 'archive'}
                onClick={() => onViewChange('archive')}
                className={cn(
                  "rounded-r-full mr-2 transition-all duration-300",
                  currentView === 'archive' && "bg-primary/15 text-primary font-bold shadow-sm"
                )}
              >
                <Archive className={cn(currentView === 'archive' && "text-primary")} />
                <span>Archive</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton 
                tooltip="Trash" 
                isActive={currentView === 'trash'}
                onClick={() => onViewChange('trash')}
                className={cn(
                  "rounded-r-full mr-2 transition-all duration-300",
                  currentView === 'trash' && "bg-primary/15 text-primary font-bold shadow-sm"
                )}
              >
                <Trash2 className={cn(currentView === 'trash' && "text-primary")} />
                <span>Trash</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>
      <SidebarRail />
    </Sidebar>
  );
}
