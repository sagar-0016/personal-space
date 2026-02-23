"use client"

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Note } from '@/lib/types';
import { Navbar } from '@/components/Navbar';
import { CreateNote } from '@/components/CreateNote';
import { NoteCard } from '@/components/NoteCard';
import { NoteModal } from '@/components/NoteModal';
import { AppSidebar } from '@/components/AppSidebar';
import { SettingsDialog } from '@/components/SettingsDialog';
import { Loader2, Pin, Trash2, Archive, Layers, Tag as TagIcon } from 'lucide-react';
import { useUser, useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { collection, doc } from 'firebase/firestore';
import { addDocumentNonBlocking, updateDocumentNonBlocking, deleteDocumentNonBlocking } from '@/firebase/non-blocking-updates';
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar';
import { parseNoteFormat } from '@/lib/note-parser';
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
  const [hideEmptyLabels, setHideEmptyLabels] = useState(false);

  useEffect(() => {
    if (!isUserLoading && !user) {
      router.push('/login');
    }
  }, [user, isUserLoading, router]);

  const notesQuery = useMemoFirebase(() => {
    if (!db || !user) return null;
    return collection(db, 'users', user.uid, 'notes');
  }, [db, user]);

  const { data: notes, isLoading: isNotesLoading } = useCollection<Note>(notesQuery);

  const handleCreateNote = (newNoteData: { title: string; content: string; isPinned: boolean; isArchived?: boolean }) => {
    if (!db || !user) return;
    
    const parsed = parseNoteFormat(newNoteData.content);
    const finalTitle = parsed.isStructured && parsed.title ? parsed.title : newNoteData.title;
    const finalLabels = parsed.isStructured ? parsed.labels : [];

    const noteRef = collection(db, 'users', user.uid, 'notes');
    const newNote = {
      title: finalTitle || 'Untitled Note',
      content: newNoteData.content,
      userId: user.uid,
      updatedAt: Date.now(),
      createdAt: Date.now(),
      isPinned: newNoteData.isPinned,
      isArchived: !!newNoteData.isArchived,
      isDeleted: false,
      labels: finalLabels
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

  const handleDeleteLabel = (labelToDelete: string) => {
    if (!db || !user || !notes) return;
    notes.forEach(note => {
      if (note.labels?.includes(labelToDelete)) {
        const noteRef = doc(db, 'users', user.uid, 'notes', note.id);
        const updatedLabels = note.labels?.filter(l => l !== labelToDelete) || [];
        updateDocumentNonBlocking(noteRef, { labels: updatedLabels, updatedAt: Date.now() });
      }
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
    updateDocumentNonBlocking(noteRef, {
      isArchived: !note.isArchived,
      isPinned: false,
      updatedAt: Date.now()
    });
  };

  const handleTrashNote = (note: Note) => {
    if (!db || !user) return;
    const noteRef = doc(db, 'users', user.uid, 'notes', note.id);
    updateDocumentNonBlocking(noteRef, {
      isDeleted: !note.isDeleted,
      isPinned: false,
      updatedAt: Date.now()
    });
  };

  const handleTogglePin = (note: Note) => {
    if (!db || !user) return;
    const noteRef = doc(db, 'users', user.uid, 'notes', note.id);
    updateDocumentNonBlocking(noteRef, {
      isPinned: !note.isPinned,
      isArchived: false,
      updatedAt: Date.now()
    });
  };

  const handleEditNote = (note: Note) => {
    setEditingNote(note);
    setIsModalOpen(true);
  };

  const allFilteredNotes = (notes || []).filter(n => {
    const matchesSearch = (n.title || '').toLowerCase().includes(searchQuery.toLowerCase()) || 
                         (n.content || '').toLowerCase().includes(searchQuery.toLowerCase());
    
    if (!matchesSearch) return false;

    // Strict filtering: 'all' excludes archived and deleted
    if (currentView === 'all') return !n.isDeleted && !n.isArchived;
    if (currentView === 'untagged') return !n.isArchived && !n.isDeleted && (!n.labels || n.labels.length === 0);
    if (currentView === 'archive') return !!n.isArchived && !n.isDeleted;
    if (currentView === 'trash') return !!n.isDeleted;
    
    if (currentView.startsWith('label:')) {
      const label = currentView.split(':')[1];
      return n.labels?.includes(label) && !n.isDeleted && !n.isArchived;
    }
    
    return !n.isArchived && !n.isDeleted;
  }).sort((a, b) => b.updatedAt - a.updatedAt);

  const pinnedNotes = allFilteredNotes.filter(n => n.isPinned);
  const otherNotes = allFilteredNotes.filter(n => !n.isPinned);

  const allLabels = Array.from(new Set((notes || []).flatMap(n => n.labels || []))).sort();
  const labelActiveCounts = allLabels.reduce((acc, label) => {
    const count = (notes || []).filter(n => !n.isDeleted && !n.isArchived && n.labels?.includes(label)).length;
    acc[label] = count;
    return acc;
  }, {} as Record<string, number>);

  if (isUserLoading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const gridClassName = cn(
    "gap-4 max-w-7xl mx-auto px-4",
    viewMode === 'grid' 
      ? "columns-1 sm:columns-2 lg:columns-3 xl:columns-4" 
      : "flex flex-col max-w-3xl"
  );

  return (
    <SidebarProvider defaultOpen={true}>
      <div className="h-screen flex flex-col w-full bg-background transition-colors duration-700 relative overflow-hidden">
        <Navbar 
          onSearch={setSearchQuery} 
          viewMode={viewMode}
          onViewModeToggle={() => setViewMode(prev => prev === 'grid' ? 'list' : 'grid')}
          onOpenSettings={() => setIsSettingsOpen(true)}
        />
        
        <div className="flex flex-1 overflow-hidden">
          <AppSidebar 
            currentView={currentView} 
            onViewChange={setCurrentView} 
            labels={allLabels}
            labelCounts={labelActiveCounts}
            onDeleteLabel={handleDeleteLabel}
            hideEmptyLabels={hideEmptyLabels}
          />
          
          <SidebarInset className="flex-1 overflow-y-auto bg-transparent">
            <main className="container mx-auto pt-8 pb-32">
              {(currentView === 'all' || currentView === 'untagged') && <CreateNote onSave={handleCreateNote} />}

              {isNotesLoading ? (
                <div className="flex justify-center py-20">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : allFilteredNotes.length > 0 ? (
                <div className="space-y-12">
                  {pinnedNotes.length > 0 && (
                    <div className="space-y-6">
                      <div className="flex items-center space-x-2 px-8 max-w-7xl mx-auto">
                        <Pin className="h-4 w-4 text-primary fill-current" />
                        <h2 className="text-[10px] font-bold text-primary uppercase tracking-[0.3em]">Pinned</h2>
                      </div>
                      <div className={gridClassName}>
                        {pinnedNotes.map((note) => (
                          <div key={note.id} className="break-inside-avoid-column mb-4">
                            <NoteCard 
                              note={note} 
                              onEdit={handleEditNote} 
                              onUpdate={handleUpdateNote}
                              onDelete={() => handleTrashNote(note)}
                              onArchive={() => handleArchiveNote(note)}
                              onTogglePin={() => handleTogglePin(note)}
                              isTrash={currentView === 'trash'}
                              onPermanentDelete={() => handlePermanentDelete(note.id)}
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="space-y-6">
                    {pinnedNotes.length > 0 && (
                      <div className="flex items-center space-x-2 px-8 max-w-7xl mx-auto">
                        <h2 className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.3em]">Notes</h2>
                      </div>
                    )}
                    <div className={gridClassName}>
                      {otherNotes.map((note) => (
                        <div key={note.id} className="break-inside-avoid-column mb-4">
                          <NoteCard 
                            note={note} 
                            onEdit={handleEditNote} 
                            onUpdate={handleUpdateNote}
                            onDelete={() => handleTrashNote(note)}
                            onArchive={() => handleArchiveNote(note)}
                            onTogglePin={() => handleTogglePin(note)}
                            isTrash={currentView === 'trash'}
                            onPermanentDelete={() => handlePermanentDelete(note.id)}
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-32 text-muted-foreground">
                  <div className="p-10 bg-primary/5 rounded-full mb-6 border border-primary/10">
                    {currentView === 'trash' ? <Trash2 className="h-16 w-16 text-primary opacity-40" /> : 
                     currentView === 'archive' ? <Archive className="h-16 w-16 text-primary opacity-40" /> :
                     currentView === 'untagged' ? <TagIcon className="h-16 w-16 text-primary opacity-40" /> :
                     <Layers className="h-16 w-16 text-primary opacity-40" />}
                  </div>
                  <p className="text-2xl font-semibold text-foreground/80">
                    {currentView === 'trash' ? "Trash is empty" : 
                     currentView === 'archive' ? "Archive is empty" :
                     currentView === 'untagged' ? "No untagged notes" :
                     currentView.startsWith('label:') ? `No notes with label "${currentView.split(':')[1]}"` :
                     "No notes match your search"}
                  </p>
                  <p className="text-sm opacity-60 mt-3">{currentView === 'all' ? "Try capturing a new thought." : ""}</p>
                </div>
              )}
            </main>
          </SidebarInset>
        </div>

        <NoteModal 
          note={editingNote} 
          isOpen={isModalOpen} 
          onClose={() => setIsModalOpen(false)} 
          onSave={handleUpdateNote}
        />

        <SettingsDialog 
          isOpen={isSettingsOpen} 
          onClose={() => setIsSettingsOpen(false)}
          hideEmptyLabels={hideEmptyLabels}
          onToggleHideEmptyLabels={() => setHideEmptyLabels(!hideEmptyLabels)}
        />
      </div>
    </SidebarProvider>
  );
}