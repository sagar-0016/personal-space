
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
    <Sidebar collapsible="icon" className="border-r-0 pt-16">
      <SidebarContent>
        <SidebarGroup>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton 
                tooltip="Notes" 
                isActive={currentView === 'notes'}
                onClick={() => onViewChange('notes')}
                className="rounded-r-full mr-2"
              >
                <Lightbulb />
                <span>Notes</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>Labels</SidebarGroupLabel>
          <SidebarMenu>
            {labels.map((label) => (
              <SidebarMenuItem key={label}>
                <SidebarMenuButton 
                  tooltip={label} 
                  isActive={currentView === `label:${label}`}
                  onClick={() => onViewChange(`label:${label}`)}
                  className="rounded-r-full mr-2"
                >
                  <Tag className="h-4 w-4" />
                  <span>{label}</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
            {labels.length === 0 && (
              <div className="px-4 py-2 text-xs text-muted-foreground italic">
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
                className="rounded-r-full mr-2"
              >
                <Archive />
                <span>Archive</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton 
                tooltip="Trash" 
                isActive={currentView === 'trash'}
                onClick={() => onViewChange('trash')}
                className="rounded-r-full mr-2"
              >
                <Trash2 />
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
