
"use client"

import React, { useState, useEffect, useRef, useCallback } from 'react';
import * as LucideIcons from 'lucide-react';
import { 
  Dialog, 
  DialogContent, 
  DialogTitle, 
  DialogHeader, 
  DialogFooter 
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Note, Project, Label } from '@/lib/types';
import { RichEditor, CodeBlockComponent } from './RichEditor';
import { Textarea } from '@/components/ui/textarea';
import { 
  X, 
  Tag as TagIcon, 
  Layers, 
  Trash2, 
  Briefcase, 
  Loader2, 
  Hash,
  Plus,
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
  Zap,
  Code,
  Database,
  Book,
  Star,
  Heart,
  Target,
  Compass,
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
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { updateMetadataWithInfo, generateDefaultMetadata, extractMetadataInfo } from '@/lib/note-parser';
import { EditorToolbar } from './EditorToolbar';
import { useEditor, ReactNodeViewRenderer } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import TaskList from '@tiptap/extension-task-list';
import TaskItem from '@tiptap/extension-task-item';
import Table from '@tiptap/extension-table';
import TableRow from '@tiptap/extension-table-row';
import TableHeader from '@tiptap/extension-table-header';
import TableCell from '@tiptap/extension-table-cell';
import CodeBlockLowlight from '@tiptap/extension-code-block-lowlight';
import { common, createLowlight } from 'lowlight';
import { Markdown } from 'tiptap-markdown';
import { format } from 'date-fns';
import { MarkdownRenderer } from './MarkdownRenderer';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useUser, useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { collection, addDoc } from 'firebase/firestore';
import { createProjectWithDefaultLabel } from '@/firebase/non-blocking-updates';

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

interface NoteModalProps {
  note: Note | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (note: Note) => void;
  onDelete: (note: Note) => void;
}

export function NoteModal({ note, isOpen, onClose, onSave, onDelete }: NoteModalProps) {
  const { user } = useUser();
  const db = useFirestore();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [metadata, setMetadata] = useState('');
  const [projectId, setProjectId] = useState<string>('none');
  const [labelId, setLabelId] = useState<string>('none');
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [editMode, setEditMode] = useState<'preview' | 'visual' | 'markdown'>('preview');
  const [isTagsExpanded, setIsTagsExpanded] = useState(false);
  
  const [isProjectDialogOpen, setIsProjectDialogOpen] = useState(false);
  const [isLabelDialogOpen, setIsLabelDialogOpen] = useState(false);
  const [newProjectName, setNewProjectName] = useState('');
  const [newLabelName, setNewLabelName] = useState('');
  const [selectedIcon, setSelectedIcon] = useState('Briefcase');

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const lastSavedRef = useRef<string>('');
  const isInteracting = useRef(false);

  const projectsQuery = useMemoFirebase(() => {
    if (!db || !user) return null;
    return collection(db, 'users', user.uid, 'projects');
  }, [db, user]);
  const { data: projects } = useCollection<Project>(projectsQuery);

  const labelsQuery = useMemoFirebase(() => {
    if (!db || !user || projectId === 'none') return null;
    return collection(db, 'users', user.uid, 'projects', projectId, 'labels');
  }, [db, user, projectId]);
  const { data: labels, isLoading: labelsLoading } = useCollection<Label>(labelsQuery);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({ codeBlock: false }),
      Placeholder.configure({ placeholder: "Start writing..." }),
      TaskList,
      TaskItem.configure({ nested: true }),
      Table.configure({ resizable: true }),
      TableRow,
      TableHeader,
      TableCell,
      CodeBlockLowlight.extend({
        addNodeView() {
          return ReactNodeViewRenderer(CodeBlockComponent);
        },
      }).configure({ lowlight }),
      Markdown.configure({ html: true, tightLists: true }),
    ],
    content: '',
    onUpdate: ({ editor }) => {
      const markdown = (editor.storage.markdown as any).getMarkdown();
      setContent(markdown);
    },
    editorProps: {
      attributes: {
        class: "prose prose-sm sm:prose-base dark:prose-invert max-w-none focus:outline-none min-h-[400px] py-4",
      },
    },
  });

  const adjustTextareaHeight = useCallback(() => {
    if (textareaRef.current) {
      const target = textareaRef.current;
      target.style.height = 'auto';
      target.style.height = `${target.scrollHeight}px`;
    }
  }, []);

  useEffect(() => {
    if (note && isOpen) {
      setTitle(note.title);
      setContent(note.content);
      setMetadata(note.metadata || '');
      setProjectId(note.projectId || 'none');
      setLabelId(note.labelId || 'none');
      setTags(note.tags || []);
      lastSavedRef.current = JSON.stringify({ t: note.title, c: note.content, m: note.metadata, p: note.projectId, l: note.labelId, tags: note.tags });
      if (editor) editor.commands.setContent(note.content, false);
      setEditMode('preview');
      setIsTagsExpanded(false);
    }
  }, [note?.id, isOpen, editor]);

  useEffect(() => {
    if (editMode === 'markdown' && isOpen) {
      setTimeout(adjustTextareaHeight, 50);
    }
  }, [editMode, content, isOpen, adjustTextareaHeight]);

  const setInteracting = (open: boolean) => {
    if (open) {
      isInteracting.current = true;
    } else {
      setTimeout(() => {
        isInteracting.current = false;
      }, 300);
    }
  };

  const handleMetadataChange = (newMetadata: string) => {
    setMetadata(newMetadata);
    const info = extractMetadataInfo(newMetadata);
    if (info.tags) setTags(info.tags);
    if (info.title) setTitle(info.title);
  };

  const performSave = (isClosing: boolean = false) => {
    if (!note || isInteracting.current) return;
    
    const projectName = projects?.find(p => p.id === projectId)?.name || '';
    const labelName = labels?.find(l => l.id === labelId)?.name || '';

    const updatedMetadata = updateMetadataWithInfo(metadata || generateDefaultMetadata(title), {
      title,
      project: projectName,
      labels: [labelName],
      tags: tags
    });

    const currentData = {
      ...note,
      title: title || 'Untitled Note',
      content: content,
      metadata: updatedMetadata,
      projectId: projectId === 'none' ? null : projectId,
      labelId: labelId === 'none' ? null : labelId,
      tags: tags,
      updatedAt: Date.now()
    };
    
    const currentStr = JSON.stringify({ t: currentData.title, c: currentData.content, m: currentData.metadata, p: currentData.projectId, l: currentData.labelId, tags: currentData.tags });
    if (currentStr !== lastSavedRef.current) {
      onSave(currentData);
      lastSavedRef.current = currentStr;
    }
    if (isClosing) onClose();
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
    setInteracting(true);
    const id = await createProjectWithDefaultLabel(db, user.uid, newProjectName.trim(), selectedIcon);
    if (id) {
      setProjectId(id);
    }
    setIsProjectDialogOpen(false);
    setNewProjectName('');
    setSelectedIcon('Briefcase');
    setInteracting(false);
  };

  const handleCreateLabelAction = async () => {
    if (projectId === 'none' || !newLabelName.trim() || !db || !user) return;
    setInteracting(true);
    const labelsRef = collection(db, 'users', user.uid, 'projects', projectId, 'labels');
    const docRef = await addDoc(labelsRef, { name: newLabelName.trim(), isDefault: false });
    setLabelId(docRef.id);
    setIsLabelDialogOpen(false);
    setNewLabelName('');
    setInteracting(false);
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={(open) => {
        if (!open && !isInteracting.current) performSave(true);
      }}>
        <DialogContent 
          className="sm:max-w-[950px] w-full sm:w-[95vw] h-[100svh] sm:h-auto sm:max-h-[95vh] flex flex-col p-0 border-none rounded-none sm:rounded-2xl overflow-y-auto overflow-x-hidden z-[100] bg-background shadow-2xl"
          onPointerDownOutside={(e) => {
            const target = e.target as HTMLElement;
            if (!document.body.contains(target) || isInteracting.current) {
              e.preventDefault();
            }
          }}
          onFocusOutside={(e) => {
            if (isInteracting.current) e.preventDefault();
          }}
        >
          <DialogTitle className="sr-only">Edit Note: {title}</DialogTitle>
          
          <div className="flex flex-col border-b bg-card/50 backdrop-blur-md sticky top-0 z-[50]">
            <div className="flex flex-wrap items-center justify-between p-3 sm:p-4 gap-2 sm:gap-4">
              <div className="flex items-center space-x-2 sm:space-x-3">
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={() => performSave(true)}
                  className="h-7 w-7 sm:h-8 sm:w-8 bg-primary/10 hover:bg-primary/20 rounded-lg flex items-center justify-center shrink-0 transition-all active:scale-95"
                  title="Save and Close"
                >
                  <Layers className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-primary" />
                </Button>
                <div className="flex items-center bg-secondary/30 rounded-lg p-0.5 sm:p-1 pb-1.5">
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => setEditMode('preview')} 
                    className={cn(
                      "h-6 sm:h-7 px-2 sm:px-4 text-[10px] sm:text-xs font-bold uppercase tracking-tight transition-all", 
                      editMode === 'preview' ? "bg-primary text-primary-foreground shadow-sm" : "hover:bg-primary/10 hover:text-primary"
                    )}
                  >
                    Preview
                  </Button>
                  
                  <div className="relative flex flex-col items-center">
                    <div className="flex items-center">
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => setEditMode('visual')} 
                        className={cn(
                          "h-6 sm:h-7 px-2 sm:px-4 text-[10px] sm:text-xs font-bold uppercase tracking-tight transition-all", 
                          editMode === 'visual' ? "bg-primary text-primary-foreground shadow-sm" : "hover:bg-primary/10 hover:text-primary"
                        )}
                      >
                        Visual
                      </Button>

                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => setEditMode('markdown')} 
                        className={cn(
                          "h-6 sm:h-7 px-2 sm:px-4 text-[10px] sm:text-xs font-bold uppercase tracking-tight transition-all", 
                          editMode === 'markdown' ? "bg-primary text-primary-foreground shadow-sm" : "hover:bg-primary/10 hover:text-primary"
                        )}
                      >
                        .MD
                      </Button>
                    </div>

                    <div className="absolute -bottom-3.5 flex items-center justify-center w-full gap-2 px-2 animate-in fade-in slide-in-from-top-1 duration-300">
                      <div className="h-[1px] flex-1 bg-primary/40 rounded-full shadow-[0_0_4px_hsl(var(--primary)/0.3)]" />
                      <span className="text-[7px] font-black text-primary uppercase tracking-[0.2em] whitespace-nowrap">EDIT</span>
                      <div className="h-[1px] flex-1 bg-primary/40 rounded-full shadow-[0_0_4px_hsl(var(--primary)/0.3)]" />
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-1.5 sm:gap-3 flex-wrap justify-end max-w-full">
                <Button 
                  variant="ghost" 
                  onClick={() => setIsTagsExpanded(!isTagsExpanded)}
                  className={cn(
                    "h-7 sm:h-8 px-2 sm:px-3 border-none rounded-full flex items-center gap-1.5 sm:gap-2 transition-all",
                    isTagsExpanded ? "bg-primary text-primary-foreground shadow-lg scale-105" : "bg-primary/5 hover:bg-primary/10"
                  )}
                >
                  <Hash className={cn("h-3.5 w-3.5", isTagsExpanded ? "text-primary-foreground" : "text-primary")} />
                  <div className="flex items-center gap-1 max-w-[60px] sm:max-w-[120px] overflow-hidden">
                    {tags.length > 0 ? (
                      <span className={cn("text-[8px] sm:text-[9px] font-black truncate lowercase", isTagsExpanded ? "text-primary-foreground/90" : "text-primary/70")}>#{tags[0]}</span>
                    ) : (
                      <span className={cn("text-[8px] sm:text-[9px] font-black uppercase tracking-widest", isTagsExpanded ? "text-primary-foreground/50" : "text-muted-foreground/40")}>Tags</span>
                    )}
                  </div>
                </Button>

                <Select value={labelId} onValueChange={(val) => val === 'new' ? setIsLabelDialogOpen(true) : setLabelId(val)} onOpenChange={setInteracting}>
                  <SelectTrigger className="w-[85px] sm:w-[130px] h-7 sm:h-8 text-[9px] sm:text-[10px] font-black uppercase tracking-widest bg-primary/5 border-none shadow-none focus:ring-0">
                    <div className="flex items-center gap-1 sm:gap-2 truncate max-w-[60px] sm:max-w-full">
                      <TagIcon className="h-3 w-3 sm:h-3.5 sm:w-3.5 text-primary shrink-0" />
                      <SelectValue placeholder="Label" className="truncate" />
                    </div>
                  </SelectTrigger>
                  <SelectContent className="z-[200]">
                    {labelsLoading ? <div className="p-2"><Loader2 className="h-3 w-3 animate-spin mx-auto" /></div> : 
                     labels?.map(l => <SelectItem key={l.id} value={l.id} className="truncate">{l.name}</SelectItem>)}
                    <SelectItem value="new" className="text-primary font-bold">+ Create New</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={projectId} onValueChange={(val) => val === 'new' ? setIsProjectDialogOpen(true) : setProjectId(val)} onOpenChange={setInteracting}>
                  <SelectTrigger className="w-[95px] sm:w-[150px] h-7 sm:h-8 text-[9px] sm:text-[10px] font-black uppercase tracking-widest bg-primary/5 border-none shadow-none focus:ring-0">
                    <div className="flex items-center gap-1 sm:gap-2 truncate max-w-[70px] sm:max-w-full">
                      <Briefcase className="h-3 w-3 sm:h-3.5 sm:w-3.5 text-primary shrink-0" />
                      <SelectValue placeholder="Project" className="truncate" />
                    </div>
                  </SelectTrigger>
                  <SelectContent className="z-[200]">
                    <SelectItem value="none">No Project</SelectItem>
                    {projects?.map(p => (
                      <SelectItem 
                        key={p.id} 
                        value={p.id} 
                        className="truncate"
                        icon={(LucideIcons as any)[p.iconName || 'Briefcase'] && React.createElement((LucideIcons as any)[p.iconName || 'Briefcase'], { className: "h-3.5 w-3.5" })}
                      >
                        {p.name}
                      </SelectItem>
                    ))}
                    <SelectItem value="new" className="text-primary font-bold">+ Create New</SelectItem>
                  </SelectContent>
                </Select>

                <Button variant="ghost" size="icon" onClick={() => performSave(true)} className="rounded-full h-8 w-8 sm:h-9 sm:w-9 hidden sm:flex"><X className="h-4 w-4" /></Button>
              </div>
            </div>

            {isTagsExpanded && (
              <div className="px-3 sm:px-6 pb-4 pt-0 animate-in slide-in-from-top-2 duration-300">
                <div className="bg-primary/5 rounded-xl sm:rounded-2xl p-3 sm:p-4 border border-primary/10 space-y-3">
                  <div className="flex flex-wrap gap-1.5 sm:gap-2">
                    {tags.map(t => (
                      <Badge key={t} variant="secondary" className="text-[9px] sm:text-[10px] font-bold px-2 sm:px-3 py-1 bg-background text-primary border-primary/10 flex items-center gap-1 sm:gap-2 rounded-lg shadow-sm">
                        {t} <X className="h-3 w-3 cursor-pointer hover:text-destructive" onClick={() => removeTag(t)} />
                      </Badge>
                    ))}
                    <div className="flex items-center bg-background rounded-lg px-2 sm:px-3 py-0.5 sm:py-1 border border-primary/20 shadow-sm focus-within:border-primary transition-all">
                      <input 
                        autoFocus
                        placeholder="Add tag..." 
                        className="bg-transparent border-none text-[10px] sm:text-[11px] font-bold uppercase tracking-widest outline-none w-24 sm:w-32 placeholder:text-muted-foreground/30" 
                        value={tagInput} 
                        onChange={(e) => setTagInput(e.target.value)} 
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            addTag();
                          }
                        }} 
                      />
                      <Button variant="ghost" size="icon" className="h-4 w-4 rounded-full p-0" onClick={addTag}><Plus className="h-3 w-3" /></Button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {editMode !== 'preview' && (
            <EditorToolbar 
              editor={editMode === 'visual' ? editor : null} 
              textareaRef={textareaRef} 
              metadata={metadata} 
              onMetadataChange={handleMetadataChange} 
              onContentChange={setContent} 
            />
          )}

          <div className="pt-4 sm:pt-8 pb-32">
            <div className="px-6 sm:px-10 space-y-4 sm:space-y-6">
              <Input 
                placeholder="Note Title" 
                value={title} 
                onChange={(e) => setTitle(e.target.value)} 
                readOnly={editMode === 'preview'}
                className={cn(
                  "border-none shadow-none focus-visible:ring-0 focus-visible:ring-offset-0 outline-none text-xl sm:text-3xl font-black px-0 bg-transparent h-auto placeholder:opacity-20 transition-all",
                  editMode === 'preview' ? "cursor-default select-none" : "cursor-text"
                )} 
              />
            </div>
            
            <div className="mt-4 sm:mt-8 px-6 sm:px-10">
              {editMode === 'preview' ? (
                <div className="min-h-[400px] py-4"><MarkdownRenderer content={content || "_No content to preview_"} /></div>
              ) : editMode === 'visual' ? (
                <RichEditor editor={editor} className="min-h-[400px]" />
              ) : (
                <div className="min-h-[400px]">
                  <Textarea 
                    ref={textareaRef} 
                    value={content} 
                    onChange={(e) => {
                      setContent(e.target.value);
                      adjustTextareaHeight();
                    }} 
                    placeholder="Edit Markdown..." 
                    className="w-full border-none shadow-none focus-visible:ring-0 px-0 bg-transparent font-mono text-sm leading-relaxed min-h-[400px] h-auto resize-none overflow-hidden" 
                  />
                </div>
              )}
            </div>
          </div>

          <div className="p-4 sm:p-6 bg-card border-t flex flex-col sm:flex-row gap-2 sm:gap-4 sm:justify-between items-center px-6 sm:px-10 sticky bottom-0 z-50">
            <div className="flex items-center gap-4 sm:gap-6 w-full sm:w-auto">
              <div className="flex flex-col space-y-0.5 text-[8px] sm:text-[10px] text-muted-foreground/60 font-medium uppercase tracking-tight flex-1">
                {note && (
                  <>
                    <div className="flex items-center gap-1.5"><span className="font-bold text-primary/40">Created:</span><span>{format(note.createdAt, 'MMM d, yy · HH:mm')}</span></div>
                    <div className="flex items-center gap-1.5"><span className="font-bold text-primary/40">Edited:</span><span>{format(note.updatedAt, 'MMM d, yy · HH:mm')}</span></div>
                  </>
                )}
              </div>
              <Button variant="ghost" size="icon" onClick={() => { if (note) { onDelete(note); onClose(); } }} className="rounded-full h-8 w-8 sm:h-9 sm:w-9 text-muted-foreground hover:text-destructive hover:bg-destructive/10 shrink-0"><Trash2 className="h-4 w-4" /></Button>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
              <Button 
                variant="ghost" 
                onClick={() => performSave(true)} 
                className="sm:hidden font-black text-[10px] uppercase tracking-widest h-9 w-full hover:bg-secondary/50 border border-border/40 rounded-xl"
              >
                Close
              </Button>
              <Button 
                onClick={() => performSave(true)} 
                className="rounded-xl px-8 sm:px-10 h-10 sm:h-11 font-black text-[10px] sm:text-xs uppercase tracking-widest bg-primary hover:bg-primary/90 shadow-lg shadow-primary/20 w-full sm:w-auto"
              >
                Save Note
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

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
              <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Custom Lucide Icon Name</label>
              <div className="flex gap-2">
                <Input 
                  placeholder="e.g. Flame, Rocket, Crown..." 
                  value={selectedIcon} 
                  onChange={(e) => setSelectedIcon(e.target.value)}
                />
                <div className="h-10 w-10 flex items-center justify-center bg-secondary rounded-lg border">
                  {React.createElement((LucideIcons as any)[selectedIcon] || HelpCircle, { className: "h-5 w-5 text-primary" })}
                </div>
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Choose From List</label>
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
            <Button onClick={handleCreateProjectAction} className="w-full sm:w-auto">Create Project</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

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
    </>
  );
}
