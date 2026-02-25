
"use client"

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Note, Project } from '@/lib/types';
import { Navbar } from '@/components/Navbar';
import { CreateNote } from '@/components/CreateNote';
import { NoteCard } from '@/components/NoteCard';
import { NoteModal } from '@/components/NoteModal';
import { AppSidebar } from '@/components/AppSidebar';
import { SettingsDialog } from '@/components/SettingsDialog';
import { Loader2, Pin, Trash2, Archive, Layers, LayoutPanelLeft } from 'lucide-react';
import { useUser, useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { collection, doc } from 'firebase/firestore';
import { addDocumentNonBlocking, updateDocumentNonBlocking, deleteDocumentNonBlocking } from '@/firebase/non-blocking-updates';
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar';
import { extractMetadataInfo } from '@/lib/note-parser';
import { cn } from '@/lib/utils';

export default function Home() {
  const { user, isUserLoading } = useUser();
  const db = useFirestore();
  const router = useRouter();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [editingNote, setEditingNote] = useState<Note | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [currentView, setCurrentView] = useState('all'); 
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  
  const [hideEmptyLabels, setHideEmptyLabels] = useState(true);
  const [sortByRecent, setSortByRecent] = useState(false);

  useEffect(() => {
    if (!isUserLoading) {
      if (!user) {
        router.push('/login');
      } else {
        // Enforce verification for password users
        const isPasswordUser = user.providerData.some(p => p.providerId === 'password');
        if (isPasswordUser && !user.emailVerified) {
          router.push('/login');
        }
      }
    }
  }, [user, isUserLoading, router]);

  const notesQuery = useMemoFirebase(() => {
    if (!db || !user) return null;
    return collection(db, 'users', user.uid, 'notes');
  }, [db, user]);
  const { data: notes, isLoading: isNotesLoading } = useCollection<Note>(notesQuery);

  const projectsQuery = useMemoFirebase(() => {
    if (!db || !user) return null;
    return collection(db, 'users', user.uid, 'projects');
  }, [db, user]);
  const { data: projects } = useCollection<Project>(projectsQuery);

  const handleCreateNote = (newNoteData: { title: string; content: string; metadata: string; isPinned: boolean; projectId?: string; labelId?: string }) => {
    if (!db || !user) return;
    
    const info = extractMetadataInfo(newNoteData.metadata);

    const noteRef = collection(db, 'users', user.uid, 'notes');
    const newNote = {
      title: info.title || newNoteData.title || 'Untitled Note',
      content: newNoteData.content,
      metadata: newNoteData.metadata,
      userId: user.uid,
      updatedAt: Date.now(),
      createdAt: Date.now(),
      isPinned: newNoteData.isPinned,
      isArchived: false,
      isDeleted: false,
      projectId: newNoteData.projectId || null,
      labelId: newNoteData.labelId || null,
      tags: info.tags || []
    };
    addDocumentNonBlocking(noteRef, newNote);
  };

  const handleUpdateNote = (updatedNote: Note) => {
    if (!db || !user) return;
    const noteRef = doc(db, 'users', user.uid, 'notes', updatedNote.id);
    updateDocumentNonBlocking(noteRef, {
      ...updatedNote,
      updatedAt: Date.now()
    });
  };

  const handlePermanentDelete = (id: string) => {
    if (!db || !user) return;
    const noteRef = doc(db, 'users', user.uid, 'notes', id);
    deleteDocumentNonBlocking(noteRef);
  };

  const handleArchiveNote = (note: Note) => {
    if (!db || !user) return;
    const noteRef = doc(db, 'users', user.uid, 'notes', note.id);
    updateDocumentNonBlocking(noteRef, { isArchived: !note.isArchived, isPinned: false, updatedAt: Date.now() });
  };

  const handleTrashNote = (note: Note) => {
    if (!db || !user) return;
    const noteRef = doc(db, 'users', user.uid, 'notes', note.id);
    updateDocumentNonBlocking(noteRef, { isDeleted: !note.isDeleted, isPinned: false, updatedAt: Date.now() });
  };

  const allFilteredNotes = (notes || []).filter(n => {
    const searchLower = searchQuery.toLowerCase();
    const matchesSearch = (n.title || '').toLowerCase().includes(searchLower) || (n.content || '').toLowerCase().includes(searchLower);
    if (!matchesSearch) return false;

    if (currentView === 'all') return !n.isDeleted && !n.isArchived;
    if (currentView === 'archive') return !!n.isArchived && !n.isDeleted;
    if (currentView === 'trash') return !!n.isDeleted;
    if (currentView === 'uncategorized') return !n.projectId && !n.isDeleted && !n.isArchived;
    
    if (currentView.startsWith('project:')) {
      const parts = currentView.split(':');
      const pId = parts[1];
      const isProjectMatch = n.projectId === pId && !n.isDeleted && !n.isArchived;
      if (parts.length > 2 && parts[2] === 'label') {
        const lId = parts[3];
        return isProjectMatch && n.labelId === lId;
      }
      return isProjectMatch;
    }
    return !n.isArchived && !n.isDeleted;
  }).sort((a, b) => sortByRecent ? (b.updatedAt - a.updatedAt) : (b.createdAt - a.createdAt));

  const pinnedNotes = allFilteredNotes.filter(n => n.isPinned);
  const otherNotes = allFilteredNotes.filter(n => !n.isPinned);

  // Loading state or verification redirect check
  if (isUserLoading || !user || (!user.emailVerified && user.providerData.some(p => p.providerId === 'password'))) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const currentProjectId = currentView.startsWith('project:') ? currentView.split(':')[1] : null;

  return (
    <SidebarProvider defaultOpen={true}>
      <div className="h-screen flex flex-col w-full bg-background transition-colors duration-700 relative overflow-hidden">
        <Navbar onSearch={setSearchQuery} viewMode={viewMode} onViewModeToggle={() => setViewMode(prev => prev === 'grid' ? 'list' : 'grid')} onOpenSettings={() => setIsSettingsOpen(true)} />
        <div className="flex flex-1 overflow-hidden">
          <AppSidebar currentView={currentView} onViewChange={setCurrentView} notes={notes || []} />
          <SidebarInset className="flex-1 overflow-y-auto bg-transparent">
            <main className="container mx-auto pt-8 pb-32">
              {(currentView === 'all' || currentView.startsWith('project:')) && <CreateNote onSave={handleCreateNote} defaultProjectId={currentProjectId} />}
              {isNotesLoading ? <div className="flex justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div> : allFilteredNotes.length > 0 ? (
                <div className="space-y-12">
                  {pinnedNotes.length > 0 && (
                    <div className="space-y-6">
                      <div className="flex items-center space-x-2 px-8 max-w-7xl mx-auto"><Pin className="h-4 w-4 text-primary fill-current" /><h2 className="text-[10px] font-bold text-primary uppercase tracking-[0.3em]">Pinned</h2></div>
                      <div className={cn("gap-4 max-w-7xl mx-auto px-4", viewMode === 'grid' ? "columns-1 sm:columns-2 lg:columns-3 xl:columns-4" : "flex flex-col")}>
                        {pinnedNotes.map((note) => <div key={note.id} className="break-inside-avoid-column mb-4"><NoteCard note={note} onEdit={(n) => { setEditingNote(n); setIsModalOpen(true); }} onUpdate={handleUpdateNote} onDelete={() => handleTrashNote(note)} onArchive={() => handleArchiveNote(note)} onTogglePin={() => handleUpdateNote({...note, isPinned: !note.isPinned})} isTrash={currentView === 'trash'} onPermanentDelete={() => handlePermanentDelete(note.id)} projects={projects || []} /></div>)}
                      </div>
                    </div>
                  )}
                  <div className="space-y-6">
                    {pinnedNotes.length > 0 && <div className="flex items-center space-x-2 px-8 max-w-7xl mx-auto"><h2 className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.3em]">Notes</h2></div>}
                    <div className={cn("gap-4 max-w-7xl mx-auto px-4", viewMode === 'grid' ? "columns-1 sm:columns-2 lg:columns-3 xl:columns-4" : "flex flex-col")}>
                      {otherNotes.map((note) => <div key={note.id} className="break-inside-avoid-column mb-4"><NoteCard note={note} onEdit={(n) => { setEditingNote(n); setIsModalOpen(true); }} onUpdate={handleUpdateNote} onDelete={() => handleTrashNote(note)} onArchive={() => handleArchiveNote(note)} onTogglePin={() => handleUpdateNote({...note, isPinned: !note.isPinned})} isTrash={currentView === 'trash'} onPermanentDelete={() => handlePermanentDelete(note.id)} projects={projects || []} /></div>)}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-32 text-muted-foreground"><div className="p-10 bg-primary/5 rounded-full mb-6 border border-primary/10"><Layers className="h-16 w-16 text-primary opacity-40" /></div><p className="text-2xl font-semibold text-foreground/80">No notes found</p></div>
              )}
            </main>
          </SidebarInset>
        </div>
        <NoteModal note={editingNote} isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onSave={handleUpdateNote} onDelete={handleTrashNote} />
        <SettingsDialog isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} hideEmptyLabels={hideEmptyLabels} onToggleHideEmptyLabels={() => setHideEmptyLabels(!hideEmptyLabels)} sortByRecent={sortByRecent} onToggleSortByRecent={() => setSortByRecent(!sortByRecent)} />
      </div>
    </SidebarProvider>
  );
}
