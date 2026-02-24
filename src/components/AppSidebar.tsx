"use client"

import React, { useState } from 'react';
import { 
  Briefcase, 
  Tag, 
  Archive, 
  Trash2,
  Layers,
  ChevronRight,
  LayoutPanelLeft,
  Plus
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
  SidebarMenuSub,
  SidebarMenuSubItem,
  SidebarMenuSubButton,
  SidebarRail,
} from "@/components/ui/sidebar";
import { Note } from '@/lib/types';
import { cn } from '@/lib/utils';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

interface AppSidebarProps {
  currentView: string;
  onViewChange: (view: string) => void;
  notes: Note[];
}

export function AppSidebar({ 
  currentView, 
  onViewChange, 
  notes
}: AppSidebarProps) {
  const [newProjectName, setNewProjectName] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  
  // Extract unique projects and their specific labels
  const projectsMap = notes.reduce((acc, note) => {
    if (note.project && !note.isDeleted && !note.isArchived) {
      if (!acc[note.project]) acc[note.project] = new Set<string>();
      (note.labels || []).forEach(label => acc[note.project].add(label));
    }
    return acc;
  }, {} as Record<string, Set<string>>);

  const projects = Object.keys(projectsMap).sort();

  const handleCreateProject = () => {
    if (!newProjectName.trim()) return;
    onViewChange(`project:${newProjectName.trim()}`);
    setNewProjectName('');
    setIsDialogOpen(false);
  };

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
          <div className="flex items-center justify-between px-6 mb-2">
            <SidebarGroupLabel className="p-0 text-[10px] uppercase tracking-widest font-black opacity-60 text-primary">Projects</SidebarGroupLabel>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="ghost" size="icon" className="h-5 w-5 rounded-full hover:bg-primary/10">
                  <Plus className="h-3 w-3 text-primary" />
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle>Create New Project</DialogTitle>
                </DialogHeader>
                <div className="py-4">
                  <Input 
                    placeholder="Project name..." 
                    value={newProjectName} 
                    onChange={(e) => setNewProjectName(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleCreateProject()}
                    autoFocus
                  />
                </div>
                <DialogFooter>
                  <Button onClick={handleCreateProject}>Create Project</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
          <SidebarMenu>
            {projects.map((project) => {
              const isActiveProject = currentView.startsWith(`project:${project}`);
              const projectLabels = Array.from(projectsMap[project]).sort();
              
              return (
                <Collapsible key={project} defaultOpen={isActiveProject} className="group/project">
                  <SidebarMenuItem>
                    <CollapsibleTrigger asChild>
                      <SidebarMenuButton 
                        tooltip={project}
                        isActive={isActiveProject}
                        onClick={() => onViewChange(`project:${project}`)}
                        className={cn(
                          "rounded-r-full mr-2 transition-all duration-300",
                          isActiveProject && "bg-primary/10 text-primary font-bold"
                        )}
                      >
                        <Briefcase className={cn("h-4 w-4", isActiveProject && "text-primary")} />
                        <span className="flex-1">{project}</span>
                        {projectLabels.length > 0 && (
                          <ChevronRight className="h-3 w-3 transition-transform group-data-[state=open]/project:rotate-90" />
                        )}
                      </SidebarMenuButton>
                    </CollapsibleTrigger>
                    
                    {projectLabels.length > 0 && (
                      <CollapsibleContent>
                        <SidebarMenuSub className="bg-primary/5 ml-4 rounded-l-lg border-l-2 border-primary/20 py-1">
                          {projectLabels.map(label => {
                            const labelView = `project:${project}:label:${label}`;
                            const isLabelActive = currentView === labelView;
                            
                            return (
                              <SidebarMenuSubItem key={label}>
                                <SidebarMenuSubButton 
                                  asChild 
                                  isActive={isLabelActive}
                                  onClick={() => onViewChange(labelView)}
                                  className={cn(
                                    "cursor-pointer transition-colors px-4 py-2 h-auto",
                                    isLabelActive ? "text-primary font-bold bg-primary/10" : "hover:bg-primary/5"
                                  )}
                                >
                                  <div className="flex items-center gap-2">
                                    <Tag className={cn("h-3 w-3", isLabelActive ? "text-primary" : "text-muted-foreground/60")} />
                                    <span>{label}</span>
                                  </div>
                                </SidebarMenuSubButton>
                              </SidebarMenuSubItem>
                            );
                          })}
                        </SidebarMenuSub>
                      </CollapsibleContent>
                    )}
                  </SidebarMenuItem>
                </Collapsible>
              );
            })}
          </SidebarMenu>
        </SidebarGroup>

        <SidebarGroup className="mt-auto">
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton 
                tooltip="Not Categorized" 
                isActive={currentView === 'uncategorized'}
                onClick={() => onViewChange('uncategorized')}
                className={cn(
                  "rounded-r-full mr-2 transition-all duration-300",
                  currentView === 'uncategorized' && "bg-primary/15 text-primary font-bold shadow-sm"
                )}
              >
                <LayoutPanelLeft className={cn(currentView === 'uncategorized' && "text-primary")} />
                <span>Not Categorized</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
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
