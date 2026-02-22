"use client"

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Note } from '@/lib/types';
import { Navbar } from '@/components/Navbar';
import { CreateNote } from '@/components/CreateNote';
import { NoteCard } from '@/components/NoteCard';
import { NoteModal } from '@/components/NoteModal';
import { AppSidebar } from '@/components/AppSidebar';
import { SearchCode, Loader2, Pin, Trash2, Archive, Layers, Tag as TagIcon } from 'lucide-react';
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
  const [currentView, setCurrentView] = useState('all'); 
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

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
      title: finalTitle,
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
    
    const parsed = parseNoteFormat(updatedNote.content);
    const finalTitle = parsed.isStructured && parsed.title ? parsed.title : updatedNote.title;
    const finalLabels = parsed.isStructured ? Array.from(new Set([...(updatedNote.labels || []), ...parsed.labels])) : updatedNote.labels;

    const noteRef = doc(db, 'users', user.uid, 'notes', updatedNote.id);
    updateDocumentNonBlocking(noteRef, {
      ...updatedNote,
      title: finalTitle,
      labels: finalLabels,
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
    const matchesSearch = n.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                         n.content.toLowerCase().includes(searchQuery.toLowerCase());
    
    if (!matchesSearch) return false;

    if (currentView === 'all') return !n.isDeleted;
    if (currentView === 'untagged') return !n.isArchived && !n.isDeleted && (!n.labels || n.labels.length === 0);
    if (currentView === 'archive') return n.isArchived && !n.isDeleted;
    if (currentView === 'trash') return n.isDeleted;
    if (currentView.startsWith('label:')) {
      const label = currentView.split(':')[1];
      return n.labels?.includes(label) && !n.isDeleted;
    }
    return !n.isArchived && !n.isDeleted;
  }).sort((a, b) => b.updatedAt - a.updatedAt);

  const pinnedNotes = allFilteredNotes.filter(n => n.isPinned);
  const otherNotes = allFilteredNotes.filter(n => !n.isPinned);

  const allLabels = Array.from(new Set((notes || []).flatMap(n => n.labels || []))).sort();

  if (isUserLoading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
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
      <div className="min-h-screen flex flex-col w-full bg-background font-body transition-colors duration-700 relative overflow-hidden">
        <div className="fixed inset-0 pointer-events-none overflow-hidden -z-10">
          <div className="absolute -top-[15%] -left-[10%] w-[50%] h-[50%] rounded-full bg-primary/15 blur-[140px] animate-pulse" />
          <div className="absolute top-[30%] -right-[15%] w-[45%] h-[45%] rounded-full bg-primary/10 blur-[120px] transition-all duration-1000" />
          <div className="absolute -bottom-[10%] left-[20%] w-[30%] h-[30%] rounded-full bg-primary/5 blur-[100px]" />
        </div>

        <Navbar 
          onSearch={setSearchQuery} 
          viewMode={viewMode}
          onViewModeToggle={() => setViewMode(prev => prev === 'grid' ? 'list' : 'grid')}
        />
        
        <div className="flex flex-1 overflow-hidden">
          <AppSidebar 
            currentView={currentView} 
            onViewChange={setCurrentView} 
            labels={allLabels}
          />
          
          <SidebarInset className="flex-1 overflow-y-auto bg-transparent">
            <main className="container mx-auto py-8">
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
                        <div className="p-1 bg-primary/20 rounded-md">
                          <Pin className="h-4 w-4 text-primary fill-current" />
                        </div>
                        <h2 className="text-[10px] font-bold text-primary uppercase tracking-[0.3em]">
                          Pinned
                        </h2>
                      </div>
                      <div className={gridClassName}>
                        {pinnedNotes.map((note) => (
                          <div key={note.id} className="break-inside-avoid-column mb-4">
                            <NoteCard 
                              note={note} 
                              onEdit={handleEditNote} 
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
                        <h2 className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.3em]">
                          Others
                        </h2>
                      </div>
                    )}
                    <div className={gridClassName}>
                      {otherNotes.map((note) => (
                        <div key={note.id} className="break-inside-avoid-column mb-4">
                          <NoteCard 
                            note={note} 
                            onEdit={handleEditNote} 
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
                  <div className="p-10 bg-primary/5 rounded-full mb-6 backdrop-blur-md border border-primary/10">
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
                  <p className="text-sm opacity-60 max-w-xs text-center mt-3 leading-relaxed">
                    {currentView === 'all' ? "Try creating a new note to capture your brilliant thoughts." : "Notes you interact with will show up here."}
                  </p>
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
      </div>
    </SidebarProvider>
  );
}