
"use client"

import React, { useState } from 'react';
import dynamic from 'next/dynamic';
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
  Code,
  Database,
  Book,
  Zap,
  Star,
  Heart,
  Target,
  Compass,
  Flame,
  Rocket,
  Crown,
  Coffee,
  Globe,
  Music,
  Camera,
  Cloud,
  Map,
  Shield,
  HelpCircle,
  Brain,
  Cpu,
  Fingerprint,
  Ghost,
  GraduationCap,
  HardDrive,
  Keyboard,
  Microscope,
  Palette,
  School,
  Terminal,
  Trophy,
  Umbrella,
  Wallet,
  Wrench
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
  useSidebar,
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
  { name: 'Flame', icon: Flame },
  { name: 'Rocket', icon: Rocket },
  { name: 'Crown', icon: Crown },
  { name: 'Coffee', icon: Coffee },
  { name: 'Globe', icon: Globe },
  { name: 'Music', icon: Music },
  { name: 'Camera', icon: Camera },
  { name: 'Cloud', icon: Cloud },
  { name: 'Map', icon: Map },
  { name: 'Shield', icon: Shield },
  { name: 'Brain', icon: Brain },
  { name: 'Cpu', icon: Cpu },
  { name: 'Fingerprint', icon: Fingerprint },
  { name: 'Ghost', icon: Ghost },
  { name: 'GraduationCap', icon: GraduationCap },
  { name: 'HardDrive', icon: HardDrive },
  { name: 'Keyboard', icon: Keyboard },
  { name: 'Microscope', icon: Microscope },
  { name: 'Palette', icon: Palette },
  { name: 'School', icon: School },
  { name: 'Terminal', icon: Terminal },
  { name: 'Trophy', icon: Trophy },
  { name: 'Umbrella', icon: Umbrella },
  { name: 'Wallet', icon: Wallet },
  { name: 'Wrench', icon: Wrench },
];

/**
 * DynamicIcon - On-demand loading of Lucide icons by name.
 * Automatically converts kebab-case (camera-off) or space-separated to PascalCase (CameraOff).
 */
export function DynamicIcon({ name, className, size = 16 }: { name: string; className?: string; size?: number }) {
  const pascalName = (name || 'HelpCircle')
    .split(/[- ]/)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join('');

  const Icon = dynamic(
    () => import('lucide-react').then((mod: any) => mod[pascalName] || mod['HelpCircle']),
    { 
      ssr: false,
      loading: () => <div style={{ width: size, height: size }} className="animate-pulse bg-muted rounded-full" />
    }
  );
  return <Icon className={className} size={size} />;
}

interface ProjectItemProps {
  project: Project;
  currentView: string;
  onViewChange: (view: string) => void;
  userId: string;
  notes: Note[];
  hideEmptyLabels: boolean;
}

function ProjectItem({ project, currentView, onViewChange, userId, notes, hideEmptyLabels }: ProjectItemProps) {
  const db = useFirestore();
  const { state, isMobile } = useSidebar();
  const isDesktopCollapsed = state === "collapsed";
  const isActiveProject = currentView.startsWith(`project:${project.id}`);
  
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [newName, setNewName] = useState(project.name);
  const [selectedIcon, setSelectedIcon] = useState(project.iconName || 'Briefcase');

  const labelsQuery = useMemoFirebase(() => {
    if (!db || !userId) return null;
    return collection(db, 'users', userId, 'projects', project.id, 'labels');
  }, [db, userId, project.id]);
  
  const { data: labels, isLoading } = useCollection<Label>(labelsQuery);

  const visibleLabels = React.useMemo(() => {
    if (!labels) return [];
    if (!hideEmptyLabels) return labels;
    return labels.filter(label => {
      const hasNotes = notes.some(n => 
        n.projectId === project.id && 
        n.labelId === label.id && 
        !n.isDeleted && 
        !n.isArchived
      );
      return hasNotes;
    });
  }, [labels, notes, project.id, hideEmptyLabels]);

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
    if (!db) return;
    setIsDeleteOpen(false);
    await deleteProjectAndLabels(db, userId, project.id);
    if (isActiveProject) onViewChange('all');
  };

  return (
    <>
      <Collapsible defaultOpen={isActiveProject} className="group/project">
        <SidebarMenuItem>
          <div className="relative flex items-center h-8 mb-1 w-full group/row overflow-hidden">
            <CollapsibleTrigger asChild>
              <SidebarMenuButton 
                asChild
                tooltip={project.name}
                isActive={isActiveProject}
                className={cn(
                  "rounded-xl transition-all duration-300 h-full relative w-full",
                  !isDesktopCollapsed && "pr-14",
                  isActiveProject && "bg-primary/10 text-primary font-bold shadow-sm"
                )}
              >
                <div 
                  className="flex items-center w-full h-full px-2 py-1 cursor-pointer"
                  onClick={() => onViewChange(`project:${project.id}`)}
                >
                  <DynamicIcon name={project.iconName || 'Briefcase'} className={cn("mr-2 shrink-0", isActiveProject && "text-primary")} />
                  <span className="flex-1 truncate text-sm">{project.name}</span>
                </div>
              </SidebarMenuButton>
            </CollapsibleTrigger>
            
            <div 
              className={cn(
                "absolute flex items-center gap-0.5 transition-all pointer-events-none",
                isDesktopCollapsed 
                  ? "left-[-15px] opacity-30 group-hover/row:opacity-100 scale-90" 
                  : "right-2 opacity-0 group-hover/row:opacity-100" 
              )}
              style={{ top: '50%', transform: 'translateY(-50%)' }}
            >
              <DropdownMenu>
                <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className={cn(
                      "h-6 w-6 rounded-md hover:bg-primary/10 transition-colors pointer-events-auto",
                      isDesktopCollapsed && "hover:bg-transparent"
                    )}
                  >
                    <MoreHorizontal className="h-3.5 w-3.5" />
                  </Button>
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
                  <DropdownMenuItem onClick={() => setIsDeleteOpen(true)} className="text-destructive">
                    <Trash2 className="mr-2 h-4 w-4" />
                    <span>Delete</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              
              {!isDesktopCollapsed && !isLoading && visibleLabels.length > 0 && (
                <ChevronRight className="h-3.5 w-3.5 transition-transform group-data-[state=open]/project:rotate-90 text-muted-foreground/40 shrink-0" />
              )}
            </div>
          </div>

          {!isLoading && visibleLabels.length > 0 && (
            <CollapsibleContent>
              <SidebarMenuSub className="bg-primary/5 ml-4 rounded-xl border-l-2 border-primary/20 py-1">
                {visibleLabels.map(label => {
                  const labelView = `project:${project.id}:label:${label.id}`;
                  const isLabelActive = currentView === labelView;
                  
                  return (
                    <SidebarMenuSubItem key={label.id}>
                      <SidebarMenuSubButton 
                        asChild 
                        isActive={isLabelActive}
                        onClick={() => onViewChange(labelView)}
                        className={cn(
                          "cursor-pointer transition-colors px-4 py-2 h-auto rounded-lg",
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
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Custom Lucide Icon Name</label>
              <div className="flex gap-2">
                <Input 
                  placeholder="e.g. flame, rocket, github..." 
                  value={selectedIcon} 
                  onChange={(e) => setSelectedIcon(e.target.value)}
                />
                <div className="h-10 w-10 flex items-center justify-center bg-secondary rounded-xl border">
                  <DynamicIcon name={selectedIcon} className="text-primary" size={20} />
                </div>
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Quick Select</label>
              <div className="grid grid-cols-5 gap-2 max-h-[160px] overflow-y-auto pr-1">
                {SAMPLE_ICONS.map((item) => (
                  <Button
                    key={item.name}
                    variant="outline"
                    size="icon"
                    className={cn(
                      "h-10 w-10 rounded-xl",
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
    </>
  );
}

export function AppSidebar({ 
  currentView, 
  onViewChange, 
  notes,
  hideEmptyLabels
}: { 
  currentView: string; 
  onViewChange: (v: string) => void; 
  notes: Note[];
  hideEmptyLabels: boolean;
}) {
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
                  "rounded-xl transition-all duration-300",
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
              <Button variant="ghost" size="icon" onClick={() => setIsDialogOpen(true)} className="h-5 w-5 rounded-full hover:bg-primary/10">
                <Plus className="h-3 w-3 text-primary" />
              </Button>
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
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Custom Lucide Icon Name</label>
                    <div className="flex gap-2">
                      <Input 
                        placeholder="e.g. flame, rocket, github..." 
                        value={selectedIcon} 
                        onChange={(e) => setSelectedIcon(e.target.value)}
                      />
                      <div className="h-10 w-10 flex items-center justify-center bg-secondary rounded-xl border">
                        <DynamicIcon name={selectedIcon} className="text-primary" size={20} />
                      </div>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Quick Select</label>
                    <div className="grid grid-cols-5 gap-2 max-h-[160px] overflow-y-auto pr-1">
                      {SAMPLE_ICONS.map((item) => (
                        <Button
                          key={item.name}
                          variant="outline"
                          size="icon"
                          className={cn(
                            "h-10 w-10 rounded-xl",
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
                notes={notes}
                hideEmptyLabels={hideEmptyLabels}
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
                  "rounded-xl transition-all duration-300",
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
                  "rounded-xl transition-all duration-300",
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
                  "rounded-xl transition-all duration-300",
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
