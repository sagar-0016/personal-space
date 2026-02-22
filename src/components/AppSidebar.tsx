
"use client"

import React from 'react';
import { 
  Lightbulb, 
  Tag, 
  Archive, 
  Trash2,
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
                tooltip="Notes" 
                isActive={currentView === 'notes'}
                onClick={() => onViewChange('notes')}
                className={cn(
                  "rounded-r-full mr-2 transition-all",
                  currentView === 'notes' && "bg-primary/10 text-primary font-semibold"
                )}
              >
                <Lightbulb className={cn(currentView === 'notes' && "text-primary")} />
                <span>Notes</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel className="px-6 text-[10px] uppercase tracking-widest font-bold opacity-50">Labels</SidebarGroupLabel>
          <SidebarMenu>
            {labels.map((label) => (
              <SidebarMenuItem key={label}>
                <SidebarMenuButton 
                  tooltip={label} 
                  isActive={currentView === `label:${label}`}
                  onClick={() => onViewChange(`label:${label}`)}
                  className={cn(
                    "rounded-r-full mr-2 transition-all",
                    currentView === `label:${label}` && "bg-primary/10 text-primary font-semibold"
                  )}
                >
                  <Tag className={cn("h-4 w-4", currentView === `label:${label}` && "text-primary")} />
                  <span>{label}</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
            {labels.length === 0 && (
              <div className="px-6 py-2 text-[11px] text-muted-foreground italic opacity-50">
                No labels yet
              </div>
            )}
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
                  "rounded-r-full mr-2 transition-all",
                  currentView === 'archive' && "bg-primary/10 text-primary font-semibold"
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
                  "rounded-r-full mr-2 transition-all",
                  currentView === 'trash' && "bg-primary/10 text-primary font-semibold"
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
