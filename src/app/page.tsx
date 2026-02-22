"use client"

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Note } from '@/lib/types';
import { Navbar } from '@/components/Navbar';
import { CreateNote } from '@/components/CreateNote';
import { NoteCard } from '@/components/NoteCard';
import { NoteModal } from '@/components/NoteModal';
import { SearchCode, Loader2, Pin } from 'lucide-react';
import { useUser, useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { collection, doc } from 'firebase/firestore';
import { addDocumentNonBlocking, updateDocumentNonBlocking, deleteDocumentNonBlocking } from '@/firebase/non-blocking-updates';

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
    <div className="min-h-screen bg-background font-body transition-colors duration-500">
      <Navbar onSearch={setSearchQuery} />
      
      <main className="container mx-auto py-8">
        <CreateNote onSave={handleCreateNote} />

        {isNotesLoading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : allFilteredNotes.length > 0 ? (
          <div className="space-y-8 px-4">
            {pinnedNotes.length > 0 && (
              <div className="space-y-4">
                <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center px-4">
                  <Pin className="h-3 w-3 mr-2 rotate-45" />
                  Pinned
                </h2>
                <div className="columns-1 sm:columns-2 lg:columns-3 xl:columns-4 gap-4 space-y-4">
                  {pinnedNotes.map((note) => (
                    <div key={note.id} className="break-inside-avoid">
                      <NoteCard 
                        note={note} 
                        onEdit={handleEditNote} 
                        onDelete={handleDeleteNote}
                        onTogglePin={() => handleTogglePin(note)}
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="space-y-4">
              {pinnedNotes.length > 0 && (
                <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-4">
                  Others
                </h2>
              )}
              <div className="columns-1 sm:columns-2 lg:columns-3 xl:columns-4 gap-4 space-y-4">
                {otherNotes.map((note) => (
                  <div key={note.id} className="break-inside-avoid">
                    <NoteCard 
                      note={note} 
                      onEdit={handleEditNote} 
                      onDelete={handleDeleteNote}
                      onTogglePin={() => handleTogglePin(note)}
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
            <SearchCode className="h-12 w-12 mb-4 opacity-20" />
            <p className="text-lg">No notes found matching your search</p>
          </div>
        )}
      </main>

      <NoteModal 
        note={editingNote} 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onSave={handleUpdateNote}
      />
    </div>
  );
}
