"use client"

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Note } from '@/lib/types';
import { Navbar } from '@/components/Navbar';
import { CreateNote } from '@/components/CreateNote';
import { NoteCard } from '@/components/NoteCard';
import { NoteModal } from '@/components/NoteModal';
import { AppSidebar } from '@/components/AppSidebar';
import { SearchCode, Loader2, Pin } from 'lucide-react';
import { useUser, useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { collection, doc } from 'firebase/firestore';
import { addDocumentNonBlocking, updateDocumentNonBlocking, deleteDocumentNonBlocking } from '@/firebase/non-blocking-updates';
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar';

export default function Home() {
  const { user, isUserLoading } = useUser();
  const db = useFirestore();
  const router = useRouter();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [editingNote, setEditingNote] = useState<Note | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

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

  const handleCreateNote = (newNoteData: { title: string; content: string }) => {
    if (!db || !user) return;
    const noteRef = collection(db, 'users', user.uid, 'notes');
    const newNote = {
      title: newNoteData.title,
      content: newNoteData.content,
      userId: user.uid,
      updatedAt: Date.now(),
      createdAt: Date.now(),
      isPinned: false
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

  const handleDeleteNote = (id: string) => {
    if (!db || !user) return;
    const noteRef = doc(db, 'users', user.uid, 'notes', id);
    deleteDocumentNonBlocking(noteRef);
  };

  const handleTogglePin = (note: Note) => {
    if (!db || !user) return;
    const noteRef = doc(db, 'users', user.uid, 'notes', note.id);
    updateDocumentNonBlocking(noteRef, {
      isPinned: !note.isPinned,
      updatedAt: Date.now()
    });
  };

  const handleEditNote = (note: Note) => {
    setEditingNote(note);
    setIsModalOpen(true);
  };

  const allFilteredNotes = (notes || []).filter(n => 
    n.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
    n.content.toLowerCase().includes(searchQuery.toLowerCase())
  ).sort((a, b) => b.updatedAt - a.updatedAt);

  const pinnedNotes = allFilteredNotes.filter(n => n.isPinned);
  const otherNotes = allFilteredNotes.filter(n => !n.isPinned);

  if (isUserLoading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <SidebarProvider defaultOpen={true}>
      <div className="min-h-screen flex flex-col w-full bg-background font-body transition-colors duration-500">
        <Navbar onSearch={setSearchQuery} />
        
        <div className="flex flex-1 overflow-hidden">
          <AppSidebar />
          
          <SidebarInset className="flex-1 overflow-y-auto">
            <main className="container mx-auto py-8">
              <CreateNote onSave={handleCreateNote} />

              {isNotesLoading ? (
                <div className="flex justify-center py-20">
                  <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
              ) : allFilteredNotes.length > 0 ? (
                <div className="space-y-12 px-4 max-w-7xl mx-auto">
                  {pinnedNotes.length > 0 && (
                    <div className="space-y-6">
                      <div className="flex items-center space-x-2 px-4">
                        <div className="p-1 bg-primary/20 rounded-md">
                          <Pin className="h-4 w-4 text-primary fill-current" />
                        </div>
                        <h2 className="text-xs font-bold text-muted-foreground uppercase tracking-[0.2em]">
                          Pinned
                        </h2>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                        {pinnedNotes.map((note) => (
                          <NoteCard 
                            key={note.id}
                            note={note} 
                            onEdit={handleEditNote} 
                            onDelete={handleDeleteNote}
                            onTogglePin={() => handleTogglePin(note)}
                          />
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="space-y-6">
                    {pinnedNotes.length > 0 && (
                      <div className="flex items-center space-x-2 px-4">
                        <h2 className="text-xs font-bold text-muted-foreground uppercase tracking-[0.2em]">
                          Others
                        </h2>
                      </div>
                    )}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                      {otherNotes.map((note) => (
                        <NoteCard 
                          key={note.id}
                          note={note} 
                          onEdit={handleEditNote} 
                          onDelete={handleDeleteNote}
                          onTogglePin={() => handleTogglePin(note)}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-32 text-muted-foreground">
                  <div className="p-6 bg-secondary/50 rounded-full mb-6">
                    <SearchCode className="h-16 w-16 opacity-20" />
                  </div>
                  <p className="text-xl font-medium">No notes match your search</p>
                  <p className="text-sm opacity-60">Try searching for something else or create a new note.</p>
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
