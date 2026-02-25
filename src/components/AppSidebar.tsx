"use client"

import React, { useState } from 'react';
import * as LucideIcons from 'lucide-react';
import { 
  Briefcase, 
  Tag, 
  Archive, 
  Trash2,
  Layers,
  ChevronRight,
  LayoutPanelLeft,
  Plus,
  Loader2,
  MoreHorizontal,
  Edit2,
  AlertTriangle,
  Code,
  Database,
  Book,
  Zap,
  Star,
  Heart,
  Target,
  Compass
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
  SidebarMenuAction,
} from "@/components/ui/sidebar";
import { Note, Project, Label } from '@/lib/types';
import { cn } from '@/lib/utils';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogTrigger,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useUser, useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { collection, doc } from 'firebase/firestore';
import { createProjectWithDefaultLabel, updateDocumentNonBlocking, deleteProjectAndLabels } from '@/firebase/non-blocking-updates';

const SAMPLE_ICONS = [
  { name: 'Briefcase', icon: Briefcase },
  { name: 'Code', icon: Code },
  { name: 'Database', icon: Database },
  { name: 'Book', icon: Book },
  { name: 'Zap', icon: Zap },
  { name: 'Star', icon: Star },
  { name: 'Heart', icon: Heart },
  { name: 'Target', icon: Target },
  { name: 'Compass', icon: Compass },
];

interface ProjectItemProps {
  project: Project;
  currentView: string;
  onViewChange: (view: string) => void;
  userId: string;
}

function ProjectItem({ project, currentView, onViewChange, userId }: ProjectItemProps) {
  const db = useFirestore();
  const isActiveProject = currentView.startsWith(`project:${project.id}`);
  
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [newName, setNewName] = useState(project.name);
  const [selectedIcon, setSelectedIcon] = useState(project.iconName || 'Briefcase');
  const [deleteConfirm, setDeleteConfirm] = useState('');

  const labelsQuery = useMemoFirebase(() => {
    if (!db || !userId) return null;
    return collection(db, 'users', userId, 'projects', project.id, 'labels');
  }, [db, userId, project.id]);
  
  const { data: labels, isLoading } = useCollection<Label>(labelsQuery);

  const handleUpdate = () => {
    if (!db || !newName.trim()) {
      setIsEditOpen(false);
      return;
    }
    const projectRef = doc(db, 'users', userId, 'projects', project.id);
    updateDocumentNonBlocking(projectRef, { 
      name: newName.trim(),
      iconName: selectedIcon 
    });
    setIsEditOpen(false);
  };

  const handleDelete = async () => {
    if (!db || deleteConfirm !== project.name) return;
    setIsDeleteOpen(false);
    await deleteProjectAndLabels(db, userId, project.id);
    if (isActiveProject) onViewChange('all');
    setDeleteConfirm('');
  };

  const IconComponent = (LucideIcons as any)[project.iconName || 'Briefcase'] || Briefcase;

  return (
    <>
      <Collapsible defaultOpen={isActiveProject} className="group/project">
        <SidebarMenuItem>
          {/* 
              CENTRAL FIX: This relative container with h-8 ensures the SidebarMenuAction 
              stays perfectly centered on the project row, even when sub-labels are visible.
          */}
          <div className="relative h-8 flex items-center mb-0.5">
            <CollapsibleTrigger asChild>
              <SidebarMenuButton 
                asChild
                tooltip={project.name}
                isActive={isActiveProject}
                className={cn(
                  "rounded-r-full mr-2 transition-all duration-300 h-full relative pr-16",
                  isActiveProject && "bg-primary/10 text-primary font-bold"
                )}
              >
                <div 
                  className="flex items-center w-full h-full px-2 py-1 cursor-pointer"
                  onClick={(e) => {
                    onViewChange(`project:${project.id}`);
                  }}
                >
                  <IconComponent className={cn("h-4 w-4 mr-2 shrink-0", isActiveProject && "text-primary")} />
                  <span className="flex-1 truncate text-sm">{project.name}</span>
                  
                  {!isLoading && labels && labels.length > 0 && (
                    <ChevronRight className="h-3.5 w-3.5 transition-transform group-data-[state=open]/project:rotate-90 absolute right-2 !top-1/2 !-translate-y-1/2" />
                  )}
                  {isLoading && (
                    <Loader2 className="h-3 w-3 animate-spin opacity-40 absolute right-2 !top-1/2 !-translate-y-1/2" />
                  )}
                </div>
              </SidebarMenuButton>
            </CollapsibleTrigger>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                <SidebarMenuAction 
                  showOnHover 
                  className="right-9 !top-1/2 !-translate-y-1/2 h-6 w-6 rounded-md hover:bg-primary/10 transition-colors" 
                >
                  <MoreHorizontal className="h-3.5 w-3.5" />
                  <span className="sr-only">Project actions</span>
                </SidebarMenuAction>
              </DropdownMenuTrigger>
              <DropdownMenuContent side="right" align="start" className="z-[100]">
                <DropdownMenuItem onClick={() => {
                  setNewName(project.name);
                  setSelectedIcon(project.iconName || 'Briefcase');
                  setIsEditOpen(true);
                }}>
                  <Edit2 className="mr-2 h-4 w-4" />
                  <span>Edit</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setIsDeleteOpen(true)} className="text-destructive focus:text-destructive">
                  <Trash2 className="mr-2 h-4 w-4" />
                  <span>Delete</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {!isLoading && labels && labels.length > 0 && (
            <CollapsibleContent>
              <SidebarMenuSub className="bg-primary/5 ml-4 rounded-l-lg border-l-2 border-primary/20 py-1">
                {labels.map(label => {
                  const labelView = `project:${project.id}:label:${label.id}`;
                  const isLabelActive = currentView === labelView;
                  
                  return (
                    <SidebarMenuSubItem key={label.id}>
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
                          <span className="truncate text-xs">{label.name}</span>
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

      {/* Edit Dialog */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="sm:max-w-[425px] z-[1000]">
          <DialogHeader>
            <DialogTitle>Edit Project</DialogTitle>
          </DialogHeader>
          <div className="py-4 space-y-4">
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Project Name</label>
              <Input 
                value={newName} 
                onChange={(e) => setNewName(e.target.value)} 
                onKeyDown={(e) => e.key === 'Enter' && handleUpdate()}
                autoFocus 
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Choose Icon</label>
              <div className="grid grid-cols-5 gap-2">
                {SAMPLE_ICONS.map((item) => (
                  <Button
                    key={item.name}
                    variant="outline"
                    size="icon"
                    className={cn(
                      "h-10 w-10",
                      selectedIcon === item.name && "border-primary bg-primary/10 text-primary"
                    )}
                    onClick={() => setSelectedIcon(item.name)}
                  >
                    <item.icon className="h-5 w-5" />
                  </Button>
                ))}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setIsEditOpen(false)}>Cancel</Button>
            <Button onClick={handleUpdate}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <DialogContent className="z-[1000]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-destructive">
              <AlertTriangle className="h-5 w-5" />
              Delete Project
            </DialogTitle>
            <DialogDescription>
              This will permanently delete the project "{project.name}" and all its labels. This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4 space-y-4">
            <p className="text-sm font-medium">
              Please type <span className="font-bold select-none">{project.name}</span> to confirm.
            </p>
            <Input 
              value={deleteConfirm} 
              onChange={(e) => setDeleteConfirm(e.target.value)}
              placeholder="Type project name..."
              onKeyDown={(e) => e.key === 'Enter' && deleteConfirm === project.name && handleDelete()}
            />
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setIsDeleteOpen(false)}>Cancel</Button>
            <Button 
              variant="destructive" 
              disabled={deleteConfirm !== project.name}
              onClick={handleDelete}
            >
              Delete Permanently
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

export function AppSidebar({ 
  currentView, 
  onViewChange, 
  notes 
}: { currentView: string; onViewChange: (v: string) => void; notes: Note[] }) {
  const { user } = useUser();
  const db = useFirestore();
  const [newProjectName, setNewProjectName] = useState('');
  const [selectedIcon, setSelectedIcon] = useState('Briefcase');
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const projectsQuery = useMemoFirebase(() => {
    if (!db || !user) return null;
    return collection(db, 'users', user.uid, 'projects');
  }, [db, user]);

  const { data: projects, isLoading } = useCollection<Project>(projectsQuery);

  const handleCreateProject = async () => {
    if (!newProjectName.trim() || !db || !user) return;
    const projectId = await createProjectWithDefaultLabel(db, user.uid, newProjectName.trim(), selectedIcon);
    if (projectId) onViewChange(`project:${projectId}`);
    setIsDialogOpen(false);
    setNewProjectName('');
    setSelectedIcon('Briefcase');
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
              <DialogContent className="sm:max-w-[425px] z-[1000]">
                <DialogHeader>
                  <DialogTitle>Create New Project</DialogTitle>
                </DialogHeader>
                <div className="py-4 space-y-4">
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Project Name</label>
                    <Input 
                      placeholder="Project name..." 
                      value={newProjectName} 
                      onChange={(e) => setNewProjectName(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleCreateProject()}
                      autoFocus
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Choose Icon</label>
                    <div className="grid grid-cols-5 gap-2">
                      {SAMPLE_ICONS.map((item) => (
                        <Button
                          key={item.name}
                          variant="outline"
                          size="icon"
                          className={cn(
                            "h-10 w-10",
                            selectedIcon === item.name && "border-primary bg-primary/10 text-primary"
                          )}
                          onClick={() => setSelectedIcon(item.name)}
                        >
                          <item.icon className="h-5 w-5" />
                        </Button>
                      ))}
                    </div>
                  </div>
                </div>
                <DialogFooter>
                  <Button onClick={handleCreateProject}>Create Project</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
          <SidebarMenu>
            {isLoading ? (
              <div className="flex justify-center p-4"><Loader2 className="h-4 w-4 animate-spin opacity-20" /></div>
            ) : projects?.map((project) => (
              <ProjectItem 
                key={project.id} 
                project={project} 
                currentView={currentView} 
                onViewChange={onViewChange}
                userId={user?.uid || ''}
              />
            ))}
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
