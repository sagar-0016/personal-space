
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
  Plus,
  Loader2,
  MoreHorizontal,
  Edit2,
  AlertTriangle
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

interface ProjectItemProps {
  project: Project;
  currentView: string;
  onViewChange: (view: string) => void;
  userId: string;
}

function ProjectItem({ project, currentView, onViewChange, userId }: ProjectItemProps) {
  const db = useFirestore();
  const isActiveProject = currentView.startsWith(`project:${project.id}`);
  
  // States for actions
  const [isRenameOpen, setIsRenameOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [newName, setNewName] = useState(project.name);
  const [deleteConfirm, setDeleteConfirm] = useState('');

  const labelsQuery = useMemoFirebase(() => {
    if (!db || !userId) return null;
    return collection(db, 'users', userId, 'projects', project.id, 'labels');
  }, [db, userId, project.id]);
  
  const { data: labels, isLoading } = useCollection<Label>(labelsQuery);

  const handleRename = () => {
    if (!db || !newName.trim() || newName === project.name) {
      setIsRenameOpen(false);
      return;
    }
    const projectRef = doc(db, 'users', userId, 'projects', project.id);
    updateDocumentNonBlocking(projectRef, { name: newName.trim() });
    setIsRenameOpen(false);
  };

  const handleDelete = async () => {
    if (!db || deleteConfirm !== project.name) return;
    await deleteProjectAndLabels(db, userId, project.id);
    if (isActiveProject) onViewChange('all');
    setIsDeleteOpen(false);
    setDeleteConfirm('');
  };

  return (
    <>
      <Collapsible defaultOpen={isActiveProject} className="group/project">
        <SidebarMenuItem>
          <CollapsibleTrigger asChild>
            <SidebarMenuButton 
              tooltip={project.name}
              isActive={isActiveProject}
              onClick={() => onViewChange(`project:${project.id}`)}
              className={cn(
                "rounded-r-full mr-2 transition-all duration-300",
                isActiveProject && "bg-primary/10 text-primary font-bold"
              )}
            >
              <Briefcase className={cn("h-4 w-4", isActiveProject && "text-primary")} />
              <span className="flex-1 truncate">{project.name}</span>
              
              {isLoading ? <Loader2 className="h-3 w-3 animate-spin opacity-40" /> : (labels && labels.length > 0) && (
                <ChevronRight className="h-3 w-3 transition-transform group-data-[state=open]/project:rotate-90" />
              )}
            </SidebarMenuButton>
          </CollapsibleTrigger>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <SidebarMenuAction showOnHover>
                <MoreHorizontal />
                <span className="sr-only">More</span>
              </SidebarMenuAction>
            </DropdownMenuTrigger>
            <DropdownMenuContent side="right" align="start">
              <DropdownMenuItem onClick={() => setIsRenameOpen(true)}>
                <Edit2 className="mr-2 h-4 w-4" />
                <span>Rename</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setIsDeleteOpen(true)} className="text-destructive focus:text-destructive">
                <Trash2 className="mr-2 h-4 w-4" />
                <span>Delete</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

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
                          <span className="truncate">{label.name}</span>
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

      {/* Rename Dialog */}
      <Dialog open={isRenameOpen} onOpenChange={setIsRenameOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Rename Project</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <Input 
              value={newName} 
              onChange={(e) => setNewName(e.target.value)} 
              onKeyDown={(e) => e.key === 'Enter' && handleRename()}
              autoFocus 
            />
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setIsRenameOpen(false)}>Cancel</Button>
            <Button onClick={handleRename}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <DialogContent>
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
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const projectsQuery = useMemoFirebase(() => {
    if (!db || !user) return null;
    return collection(db, 'users', user.uid, 'projects');
  }, [db, user]);

  const { data: projects, isLoading } = useCollection<Project>(projectsQuery);

  const handleCreateProject = async () => {
    if (!newProjectName.trim() || !db || !user) return;
    const projectId = await createProjectWithDefaultLabel(db, user.uid, newProjectName.trim());
    if (projectId) onViewChange(`project:${projectId}`);
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
