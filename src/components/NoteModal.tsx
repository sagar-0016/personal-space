"use client"

import React, { useState, useEffect, useRef } from 'react';
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
import { RichEditor } from './RichEditor';
import { Textarea } from '@/components/ui/textarea';
import { 
  X, 
  Tag, 
  Layers, 
  Trash2, 
  Briefcase, 
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
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { updateMetadataWithInfo } from '@/lib/note-parser';
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
  const [editMode, setEditMode] = useState<'preview' | 'visual' | 'markdown'>('visual');
  
  // Dialog States
  const [isProjectDialogOpen, setIsProjectDialogOpen] = useState(false);
  const [isLabelDialogOpen, setIsLabelDialogOpen] = useState(false);
  const [newProjectName, setNewProjectName] = useState('');
  const [newLabelName, setNewLabelName] = useState('');
  const [selectedIcon, setSelectedIcon] = useState('Briefcase');

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const lastSavedRef = useRef<string>('');

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
        class: "prose prose-sm sm:prose-base dark:prose-invert max-w-none focus:outline-none min-h-[400px] py-4",
      },
    },
  });

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
      setEditMode('visual');
    }
  }, [note?.id, isOpen, editor]);

  const performSave = (isClosing: boolean = false) => {
    if (!note) return;
    
    const projectName = projects?.find(p => p.id === projectId)?.name || '';
    const labelName = labels?.find(l => l.id === labelId)?.name || '';

    const updatedMetadata = updateMetadataWithInfo(metadata, {
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

  const handleCreateProjectAction = async () => {
    if (!newProjectName.trim() || !db || !user) return;
    const id = await createProjectWithDefaultLabel(db, user.uid, newProjectName.trim(), selectedIcon);
    if (id) {
      setProjectId(id);
    }
    setIsProjectDialogOpen(false);
    setNewProjectName('');
    setSelectedIcon('Briefcase');
  };

  const handleCreateLabelAction = async () => {
    if (projectId === 'none' || !newLabelName.trim() || !db || !user) return;
    const labelsRef = collection(db, 'users', user.uid, 'projects', projectId, 'labels');
    const docRef = await addDoc(labelsRef, { name: newLabelName.trim(), isDefault: false });
    setLabelId(docRef.id);
    setIsLabelDialogOpen(false);
    setNewLabelName('');
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={(open) => !open && performSave(true)}>
        <DialogContent className="sm:max-w-[950px] w-[95vw] max-h-[95vh] flex flex-col p-0 border-none rounded-2xl overflow-hidden z-[100] bg-background shadow-2xl">
          <DialogTitle className="sr-only">Edit Note: {title}</DialogTitle>
          <div className="flex items-center justify-between p-4 border-b bg-card/50 backdrop-blur-md sticky top-0 z-[50]">
            <div className="flex items-center space-x-3">
              <div className="h-8 w-8 bg-primary/10 rounded-lg flex items-center justify-center"><Layers className="h-4 w-4 text-primary" /></div>
              <div className="flex items-center bg-secondary/30 rounded-lg p-1 mr-2">
                <Button variant="ghost" size="sm" onClick={() => setEditMode('preview')} className={cn("h-7 px-4 text-xs font-bold uppercase tracking-tight transition-all", editMode === 'preview' ? "bg-primary text-primary-foreground shadow-sm" : "hover:bg-primary/10 hover:text-primary")}>Preview</Button>
                <Button variant="ghost" size="sm" onClick={() => setEditMode('visual')} className={cn("h-7 px-4 text-xs font-bold uppercase tracking-tight transition-all", editMode === 'visual' ? "bg-primary text-primary-foreground shadow-sm" : "hover:bg-primary/10 hover:text-primary")}>Visual</Button>
                <Button variant="ghost" size="sm" onClick={() => setEditMode('markdown')} className={cn("h-7 px-4 text-xs font-bold uppercase tracking-tight transition-all", editMode === 'markdown' ? "bg-primary text-primary-foreground shadow-sm" : "hover:bg-primary/10 hover:text-primary")}>Markdown</Button>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Button variant="ghost" size="icon" onClick={() => performSave(true)} className="rounded-full h-9 w-9"><X className="h-4 w-4" /></Button>
            </div>
          </div>

          {editMode !== 'preview' && (
            <EditorToolbar editor={editMode === 'visual' ? editor : null} textareaRef={textareaRef} metadata={metadata} onMetadataChange={setMetadata} onContentChange={setContent} />
          )}

          <div className="flex-1 overflow-y-auto pt-6 pb-20 scroll-smooth">
            <div className="px-10 space-y-6">
              <div className="flex items-center gap-4">
                <Select value={projectId} onValueChange={(val) => val === 'new' ? setIsProjectDialogOpen(true) : setProjectId(val)}>
                  <SelectTrigger className="w-[200px] h-9 text-[11px] font-black uppercase tracking-widest bg-primary/5 border-none shadow-none focus:ring-0">
                    <div className="flex items-center gap-2">
                      {projectId !== 'none' && projects?.find(p => p.id === projectId) && React.createElement((LucideIcons as any)[projects?.find(p => p.id === projectId)?.iconName || 'Briefcase'], { className: "h-3.5 w-3.5 text-primary" })}
                      <SelectValue placeholder="Project" />
                    </div>
                  </SelectTrigger>
                  <SelectContent className="z-[200]">
                    <SelectItem value="none">No Project</SelectItem>
                    {projects?.map(p => (
                      <SelectItem key={p.id} value={p.id}>
                        <div className="flex items-center gap-2">
                          {(LucideIcons as any)[p.iconName || 'Briefcase'] && React.createElement((LucideIcons as any)[p.iconName || 'Briefcase'], { className: "h-3.5 w-3.5" })}
                          {p.name}
                        </div>
                      </SelectItem>
                    ))}
                    <SelectItem value="new" className="text-primary font-bold">+ Create New Project</SelectItem>
                  </SelectContent>
                </Select>

                {projectId !== 'none' && (
                  <Select value={labelId} onValueChange={(val) => val === 'new' ? setIsLabelDialogOpen(true) : setLabelId(val)}>
                    <SelectTrigger className="w-[180px] h-9 text-[11px] font-black uppercase tracking-widest bg-primary/5 border-none shadow-none focus:ring-0">
                      <div className="flex items-center gap-2"><Tag className="h-3.5 w-3.5 text-primary" /><SelectValue placeholder="Label" /></div>
                    </SelectTrigger>
                    <SelectContent className="z-[200]">
                      {labelsLoading ? <div className="p-2"><Loader2 className="h-3 w-3 animate-spin mx-auto" /></div> : 
                       labels?.map(l => <SelectItem key={l.id} value={l.id}>{l.name}</SelectItem>)}
                      <SelectItem value="new" className="text-primary font-bold">+ Create New Label</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              </div>

              <Input placeholder="Note Title" value={title} onChange={(e) => setTitle(e.target.value)} className="border-none shadow-none focus-visible:ring-0 focus-visible:ring-offset-0 outline-none text-3xl font-bold px-0 bg-transparent h-auto placeholder:opacity-30" />
              
              <div className="flex flex-wrap items-center gap-2">
                <div className="flex items-center bg-primary/5 rounded-full px-3 py-1 border border-primary/10 group focus-within:border-primary/30 transition-all">
                  <Hash className="h-3.5 w-3.5 text-primary/40 mr-2" />
                  <input placeholder="Add tag..." className="bg-transparent border-none text-[11px] font-bold uppercase tracking-widest outline-none w-24 placeholder:text-muted-foreground/30" value={tagInput} onChange={(e) => setTagInput(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && tagInput.trim() && (setTags([...tags, tagInput.trim()]), setTagInput(''))} />
                </div>
                {tags.map(t => <Badge key={t} variant="secondary" className="flex items-center gap-2 rounded-lg px-3 py-1 bg-primary/10 text-primary border-none text-[11px] font-bold">{t}<X className="h-3 w-3 cursor-pointer" onClick={() => setTags(tags.filter(tg => tg !== t))} /></Badge>)}
              </div>
            </div>
            
            <div className="mt-6 px-10">
              {editMode === 'preview' ? (
                <div className="min-h-[500px] py-4"><MarkdownRenderer content={content || "_No content to preview_"} /></div>
              ) : editMode === 'visual' ? (
                <RichEditor editor={editor} className="min-h-[500px]" />
              ) : (
                <Textarea ref={textareaRef} value={content} onChange={(e) => setContent(e.target.value)} placeholder="Edit Markdown..." className="w-full border-none shadow-none focus-visible:ring-0 px-0 bg-transparent font-mono text-sm leading-relaxed min-h-[500px] resize-none overflow-hidden" />
              )}
            </div>
          </div>

          <div className="p-4 bg-card border-t flex justify-between items-center px-10">
            <div className="flex items-center gap-6">
              <div className="flex flex-col space-y-0.5 text-[10px] text-muted-foreground/60 font-medium uppercase tracking-tight">
                {note && (
                  <>
                    <div className="flex items-center gap-1.5"><span className="font-bold text-primary/40">Created:</span><span>{format(note.createdAt, 'MMM d, yyyy · HH:mm')}</span></div>
                    <div className="flex items-center gap-1.5"><span className="font-bold text-primary/40">Edited:</span><span>{format(note.updatedAt, 'MMM d, yyyy · HH:mm')}</span></div>
                  </>
                )}
              </div>
              <Button variant="ghost" size="icon" onClick={() => { if (note) { onDelete(note); onClose(); } }} className="rounded-full h-9 w-9 text-muted-foreground hover:text-destructive hover:bg-destructive/10"><Trash2 className="h-4 w-4" /></Button>
            </div>
            <Button onClick={() => performSave(true)} className="rounded-lg px-8 font-bold text-sm bg-primary hover:bg-primary/90">Save Changes</Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Project Creation Dialog */}
      <Dialog open={isProjectDialogOpen} onOpenChange={setIsProjectDialogOpen}>
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
            <Button onClick={handleCreateProjectAction}>Create Project</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Label Creation Dialog */}
      <Dialog open={isLabelDialogOpen} onOpenChange={setIsLabelDialogOpen}>
        <DialogContent className="sm:max-w-[425px] z-[1000]">
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
            <Button onClick={handleCreateLabelAction}>Create Label</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
