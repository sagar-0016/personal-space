"use client"

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { 
  Plus, 
  Pin, 
  Briefcase, 
  Tag as TagIcon, 
  X, 
  Loader2, 
  Hash,
  Star,
  Heart,
  Target,
  Compass,
  Zap,
  Code,
  Database,
  Book
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { RichEditor } from './RichEditor';
import { Textarea } from '@/components/ui/textarea';
import { generateDefaultMetadata, updateMetadataWithInfo } from '@/lib/note-parser';
import { EditorToolbar } from './EditorToolbar';
import { useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import TaskList from '@tiptap/extension-task-list';
import TaskItem from '@tiptap/extension-task-item';
import Table from '@tiptap/extension-table';
import TableRow from '@tiptap/extension-table-row';
import TableHeader from '@tiptap/extension-table-header';
import TableCell from '@tiptap/extension-table-cell';
import Image from '@tiptap/extension-image';
import Link from '@tiptap/extension-link';
import CodeBlockLowlight from '@tiptap/extension-code-block-lowlight';
import { common, createLowlight } from 'lowlight';
import { Markdown } from 'tiptap-markdown';
import { MarkdownRenderer } from './MarkdownRenderer';
import { Badge } from '@/components/ui/badge';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter 
} from '@/components/ui/dialog';
import { 
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useUser, useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { collection, addDoc } from 'firebase/firestore';
import { createProjectWithDefaultLabel } from '@/firebase/non-blocking-updates';
import { Project, Label } from '@/lib/types';
import * as LucideIcons from 'lucide-react';

const lowlight = createLowlight(common);

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

interface CreateNoteProps {
  onSave: (note: { title: string; content: string; metadata: string; isPinned: boolean; projectId?: string | null; labelId?: string | null; tags?: string[] }) => void;
  defaultProjectId?: string | null;
}

export function CreateNote({ onSave, defaultProjectId }: CreateNoteProps) {
  const { user } = useUser();
  const db = useFirestore();
  const [isExpanded, setIsExpanded] = useState(false);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [metadata, setMetadata] = useState('');
  const [isPinned, setIsPinned] = useState(false);
  const [editMode, setEditMode] = useState<'preview' | 'visual' | 'markdown'>('visual');
  
  const [selectedProjectId, setSelectedProjectId] = useState<string>(defaultProjectId || 'none');
  const [selectedLabelId, setSelectedLabelId] = useState<string>('none');
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');

  const isInteracting = useRef(false);

  const [isProjectDialogOpen, setIsProjectDialogOpen] = useState(false);
  const [isLabelDialogOpen, setIsLabelDialogOpen] = useState(false);
  const [newProjectName, setNewProjectName] = useState('');
  const [newLabelName, setNewLabelName] = useState('');
  const [selectedIcon, setSelectedIcon] = useState('Briefcase');

  const containerRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const projectsQuery = useMemoFirebase(() => {
    if (!db || !user) return null;
    return collection(db, 'users', user.uid, 'projects');
  }, [db, user]);
  const { data: projects } = useCollection<Project>(projectsQuery);

  const labelsQuery = useMemoFirebase(() => {
    if (!db || !user || selectedProjectId === 'none') return null;
    return collection(db, 'users', user.uid, 'projects', selectedProjectId, 'labels');
  }, [db, user, selectedProjectId]);
  const { data: labels, isLoading: labelsLoading } = useCollection<Label>(labelsQuery);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({ codeBlock: false }),
      Placeholder.configure({ placeholder: "Take a note..." }),
      TaskList,
      TaskItem.configure({ nested: true }),
      Table.configure({ resizable: true }),
      TableRow, TableHeader, TableCell,
      Image,
      CodeBlockLowlight.configure({ lowlight }),
      Link.configure({ openOnClick: false }),
      Markdown.configure({ html: true, tightLists: true }),
    ],
    content: '',
    onUpdate: ({ editor }) => {
      const markdown = (editor.storage.markdown as any).getMarkdown();
      setContent(markdown);
    },
    editorProps: {
      attributes: {
        class: "prose prose-sm sm:prose-base dark:prose-invert max-w-none focus:outline-none min-h-[120px] py-4",
      },
    },
  });

  useEffect(() => {
    if (defaultProjectId) setSelectedProjectId(defaultProjectId);
  }, [defaultProjectId]);

  useEffect(() => {
    if (labels && labels.length > 0 && selectedLabelId === 'none') {
      const defaultLabel = labels.find(l => l.isDefault) || labels[0];
      setSelectedLabelId(defaultLabel.id);
    }
  }, [labels, selectedLabelId]);

  const adjustTextareaHeight = useCallback(() => {
    if (textareaRef.current) {
      const target = textareaRef.current;
      target.style.height = 'auto';
      target.style.height = `${target.scrollHeight}px`;
    }
  }, []);

  useEffect(() => {
    if (editor && editMode === 'visual' && editor.storage.markdown) {
      const currentMarkdown = (editor.storage.markdown as any).getMarkdown();
      if (content !== currentMarkdown) {
        editor.commands.setContent(content, false);
      }
    }
    if (editMode === 'markdown') {
      setTimeout(adjustTextareaHeight, 0);
    }
  }, [editMode, content, editor, adjustTextareaHeight]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      const target = event.target as HTMLElement;
      if (isInteracting.current) return;
      
      const isPortal = target.closest('[data-radix-popper-content-wrapper]') || 
                       target.closest('[role="dialog"]') || 
                       target.closest('[role="menu"]') ||
                       target.closest('[data-radix-portal]');
      if (isPortal) return;

      if (containerRef.current && !containerRef.current.contains(target)) {
        if (isExpanded) {
          if (title.trim() || content.trim()) {
            handleSave();
          } else {
            setIsExpanded(false);
          }
        }
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isExpanded, title, content, isPinned, metadata, selectedProjectId, selectedLabelId, tags]);

  const setInteracting = (open: boolean) => {
    if (open) {
      isInteracting.current = true;
    } else {
      setTimeout(() => {
        isInteracting.current = false;
      }, 150);
    }
  };

  const handleSave = () => {
    if (title.trim() || content.trim()) {
      const projectName = projects?.find(p => p.id === selectedProjectId)?.name || '';
      const labelName = labels?.find(l => l.id === selectedLabelId)?.name || '';
      
      let finalMetadata = metadata || generateDefaultMetadata(title || 'Untitled');
      finalMetadata = updateMetadataWithInfo(finalMetadata, {
        project: projectName,
        labels: [labelName],
        title: title || 'Untitled',
        tags: tags
      });
      
      onSave({ 
        title: title || 'Untitled', 
        content, 
        metadata: finalMetadata, 
        isPinned,
        projectId: selectedProjectId === 'none' ? null : selectedProjectId,
        labelId: selectedLabelId === 'none' ? null : selectedLabelId,
        tags: tags
      });
    }
    resetForm();
  };

  const resetForm = () => {
    setTitle('');
    setContent('');
    setMetadata('');
    setIsPinned(false);
    setIsExpanded(false);
    setEditMode('visual');
    setTags([]);
    setTagInput('');
    setSelectedProjectId(defaultProjectId || 'none');
    setSelectedLabelId('none');
  };

  const handleMarkdownChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setContent(e.target.value);
    const target = e.target;
    target.style.height = 'auto';
    target.style.height = `${target.scrollHeight}px`;
  };

  const addTag = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
      setTags([...tags, tagInput.trim()]);
      setTagInput('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter(t => t !== tagToRemove));
  };

  const handleCreateProjectAction = async () => {
    if (!newProjectName.trim() || !db || !user) return;
    const id = await createProjectWithDefaultLabel(db, user.uid, newProjectName.trim(), selectedIcon);
    if (id) {
      setSelectedProjectId(id);
    }
    setIsProjectDialogOpen(false);
    setNewProjectName('');
    setSelectedIcon('Briefcase');
  };

  const handleCreateLabelAction = async () => {
    if (selectedProjectId === 'none' || !newLabelName.trim() || !db || !user) return;
    const labelsRef = collection(db, 'users', user.uid, 'projects', selectedProjectId, 'labels');
    const docRef = await addDoc(labelsRef, { name: newLabelName.trim(), isDefault: false });
    setSelectedLabelId(docRef.id);
    setIsLabelDialogOpen(false);
    setNewLabelName('');
  };

  return (
    <div className="w-full max-w-2xl mx-auto mb-8 sm:mb-12 px-2 sm:px-4" ref={containerRef}>
      <Card className={cn(
        "transition-all duration-300 google-shadow border border-border/40 bg-card/80 backdrop-blur-md overflow-hidden rounded-xl",
        isExpanded ? "p-0" : "p-0.5 sm:p-1"
      )}>
        {!isExpanded ? (
          <div className="flex items-center px-4 sm:px-6 py-3 sm:py-4 cursor-text" onClick={() => setIsExpanded(true)}>
            <span className="text-muted-foreground/60 font-medium flex-1 text-sm sm:text-base">Take a note...</span>
            <div className="flex items-center space-x-1 sm:space-x-2">
              <Button variant="ghost" size="icon" className="h-8 w-8 sm:h-9 sm:w-9 opacity-40 hover:bg-primary/10 hover:text-primary transition-all rounded-full">
                <Plus className="h-4 w-4 sm:h-5 sm:w-5" />
              </Button>
            </div>
          </div>
        ) : (
          <div className="flex flex-col note-fade-in">
            <div className="flex flex-col px-4 sm:px-6 pt-4 sm:pt-5 pb-2">
              <div className="flex flex-wrap items-center gap-2 mb-3 sm:mb-4">
                <div className="flex items-center bg-secondary/30 rounded-lg p-0.5 sm:p-1">
                  <Button variant="ghost" size="sm" onClick={() => setEditMode('preview')} className={cn("h-6 sm:h-7 px-2 sm:px-3 text-[9px] sm:text-[10px] font-bold uppercase tracking-tighter transition-all", editMode === 'preview' ? "bg-primary text-primary-foreground shadow-sm" : "hover:bg-primary/10 hover:text-primary")}>Preview</Button>
                  <Button variant="ghost" size="sm" onClick={() => setEditMode('visual')} className={cn("h-6 sm:h-7 px-2 sm:px-3 text-[9px] sm:text-[10px] font-bold uppercase tracking-tighter transition-all", editMode === 'visual' ? "bg-primary text-primary-foreground shadow-sm" : "hover:bg-primary/10 hover:text-primary")}>Visual</Button>
                  <Button variant="ghost" size="sm" onClick={() => setEditMode('markdown')} className={cn("h-6 sm:h-7 px-2 sm:px-3 text-[9px] sm:text-[10px] font-bold uppercase tracking-tighter transition-all", editMode === 'markdown' ? "bg-primary text-primary-foreground shadow-sm" : "hover:bg-primary/10 hover:text-primary")}>MD</Button>
                </div>

                <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 ml-auto">
                  <Popover onOpenChange={setInteracting}>
                    <PopoverTrigger asChild>
                      <Button variant="ghost" className="h-6 sm:h-7 px-2 sm:px-2.5 bg-primary/5 hover:bg-primary/10 border-none rounded-full flex items-center gap-1.5 transition-all">
                        <Hash className="h-3 w-3 text-primary" />
                        <div className="flex items-center gap-1 max-w-[60px] sm:max-w-[100px] overflow-hidden">
                          {tags.length > 0 ? (
                            <span className="text-[7px] sm:text-[8px] font-bold text-primary/70 truncate lowercase">#{tags[0]}</span>
                          ) : (
                            <span className="text-[7px] sm:text-[8px] font-bold text-muted-foreground/40 uppercase tracking-widest">Tags</span>
                          )}
                        </div>
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-64 p-4 z-[200] rounded-xl shadow-2xl border-primary/10 bg-card/95 backdrop-blur-md">
                      <div className="space-y-4">
                        <div className="flex flex-wrap gap-1.5 max-h-[150px] overflow-y-auto pr-1">
                          {tags.map(t => (
                            <Badge key={t} variant="secondary" className="text-[9px] font-bold px-2 py-0.5 bg-primary/10 text-primary border-none flex items-center gap-1">
                              {t} <X className="h-2 w-2 cursor-pointer hover:text-destructive" onClick={() => removeTag(t)} />
                            </Badge>
                          ))}
                        </div>
                        <div className="flex items-center bg-primary/5 rounded-lg px-3 py-1.5 border border-primary/10 group focus-within:border-primary/30 transition-all">
                          <Hash className="h-3 w-3 text-primary/30 mr-2" />
                          <input 
                            autoFocus
                            placeholder="Add tag..." 
                            className="bg-transparent border-none text-[11px] font-bold uppercase tracking-widest outline-none w-full placeholder:text-muted-foreground/30" 
                            value={tagInput} 
                            onChange={(e) => setTagInput(e.target.value)} 
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') {
                                e.preventDefault();
                                e.stopPropagation();
                                addTag();
                              }
                            }} 
                          />
                        </div>
                      </div>
                    </PopoverContent>
                  </Popover>

                  <Select 
                    value={selectedLabelId} 
                    onValueChange={(val) => val === 'new' ? setIsLabelDialogOpen(true) : setSelectedLabelId(val)}
                    onOpenChange={setInteracting}
                  >
                    <SelectTrigger className="w-[80px] sm:w-[110px] h-6 sm:h-7 text-[8px] sm:text-[9px] font-black uppercase tracking-widest bg-primary/5 border-none shadow-none focus:ring-0">
                      <div className="flex items-center gap-1 sm:gap-1.5 truncate">
                        <TagIcon className="h-3 w-3 text-primary shrink-0" />
                        <SelectValue placeholder="Label" className="truncate" />
                      </div>
                    </SelectTrigger>
                    <SelectContent>
                      {labelsLoading ? <div className="p-2"><Loader2 className="h-3 w-3 animate-spin mx-auto" /></div> : 
                       labels?.map(l => (
                        l.id ? <SelectItem key={l.id} value={l.id}>{l.name}</SelectItem> : null
                      ))}
                      <SelectItem value="new" className="text-primary font-bold">+ New</SelectItem>
                    </SelectContent>
                  </Select>

                  <Select 
                    value={selectedProjectId} 
                    onValueChange={(val) => val === 'new' ? setIsProjectDialogOpen(true) : setSelectedProjectId(val)}
                    onOpenChange={setInteracting}
                  >
                    <SelectTrigger className="w-[90px] sm:w-[130px] h-6 sm:h-7 text-[8px] sm:text-[9px] font-black uppercase tracking-widest bg-primary/5 border-none shadow-none focus:ring-0">
                      <div className="flex items-center gap-1 sm:gap-1.5 truncate">
                        <Briefcase className="h-3 w-3 text-primary shrink-0" />
                        <SelectValue placeholder="Project" className="truncate" />
                      </div>
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">None</SelectItem>
                      {projects?.map(p => (
                        p.id ? <SelectItem 
                                  key={p.id} 
                                  value={p.id}
                                  icon={(LucideIcons as any)[p.iconName || 'Briefcase'] && React.createElement((LucideIcons as any)[p.iconName || 'Briefcase'], { className: "h-3.5 w-3.5" })}
                                >
                                  {p.name}
                                </SelectItem> : null
                      ))}
                      <SelectItem value="new" className="text-primary font-bold">+ New</SelectItem>
                    </SelectContent>
                  </Select>

                  <Button variant="ghost" size="icon" onClick={() => setIsPinned(!isPinned)} className={cn("h-6 w-6 sm:h-7 sm:w-7 rounded-full transition-all shrink-0", isPinned ? "text-primary bg-primary/5" : "text-muted-foreground/40")}>
                    <Pin className={cn("h-3.5 w-3.5 sm:h-4 sm:w-4", isPinned && "fill-current")} />
                  </Button>
                </div>
              </div>

              <Input 
                placeholder="Title" 
                value={title} 
                onChange={(e) => setTitle(e.target.value)} 
                className="border-none shadow-none focus-visible:ring-0 focus-visible:ring-offset-0 outline-none text-xl sm:text-2xl font-bold px-0 bg-transparent placeholder:text-muted-foreground/30 transition-all" 
                autoFocus 
              />
            </div>

            <EditorToolbar 
              editor={editMode === 'visual' ? editor : null} 
              textareaRef={textareaRef} 
              metadata={metadata} 
              onMetadataChange={setMetadata} 
              onContentChange={setContent} 
            />

            <div className="px-4 sm:px-6 py-2">
              {editMode === 'preview' ? (
                <div className="min-h-[120px] py-4"><MarkdownRenderer content={content || "_No content_"} /></div>
              ) : editMode === 'visual' ? (
                <RichEditor editor={editor} className="min-h-[120px]" />
              ) : (
                <Textarea ref={textareaRef} value={content} onChange={handleMarkdownChange} placeholder="Write Markdown..." className="w-full border-none shadow-none focus-visible:ring-0 px-0 bg-transparent font-mono text-xs sm:text-sm leading-relaxed resize-none overflow-hidden" />
              )}
            </div>

            <div className="flex justify-end px-4 sm:px-6 pb-3 pt-2 border-t border-border/10 bg-secondary/5">
              <Button variant="ghost" onClick={handleSave} className="font-bold text-xs sm:text-sm px-6 sm:px-8 hover:bg-primary/10 hover:text-primary transition-all">Close</Button>
            </div>
          </div>
        )}
      </Card>

      {/* Project & Label Dialogs */}
      <Dialog open={isProjectDialogOpen} onOpenChange={(open) => { setIsProjectDialogOpen(open); setInteracting(open); }}>
        <DialogContent className="sm:max-w-[425px] w-[95vw] z-[1000]">
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
                onKeyDown={(e) => e.key === 'Enter' && handleCreateProjectAction()}
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
            <Button onClick={handleCreateProjectAction} className="w-full sm:w-auto">Create Project</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Label Creation Dialog */}
      <Dialog open={isLabelDialogOpen} onOpenChange={(open) => { setIsLabelDialogOpen(open); setInteracting(open); }}>
        <DialogContent className="sm:max-w-[425px] w-[95vw] z-[1000]">
          <DialogHeader>
            <DialogTitle>Create New Label</DialogTitle>
          </DialogHeader>
          <div className="py-4 space-y-4">
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Label Name</label>
              <Input 
                placeholder="Label name..." 
                value={newLabelName} 
                onChange={(e) => setNewLabelName(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleCreateLabelAction()}
                autoFocus
              />
            </div>
          </div>
          <DialogFooter>
            <Button onClick={handleCreateLabelAction} className="w-full sm:w-auto">Create Label</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
