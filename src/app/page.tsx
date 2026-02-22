"use client"

import React, { useState, useEffect } from 'react';
import { Note } from '@/lib/types';
import { Navbar } from '@/components/Navbar';
import { CreateNote } from '@/components/CreateNote';
import { NoteCard } from '@/components/NoteCard';
import { NoteModal } from '@/components/NoteModal';
import { SearchCode } from 'lucide-react';

export default function Home() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [editingNote, setEditingNote] = useState<Note | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Load notes from local storage
  useEffect(() => {
    const savedNotes = localStorage.getItem('notewave_notes');
    if (savedNotes) {
      setNotes(JSON.parse(savedNotes));
    } else {
      // Mock initial notes
      const initialNotes: Note[] = [
        {
          id: '1',
          title: 'Welcome to NoteWave!',
          content: 'A minimalist note-taking app inspired by Google Keep. Start by creating a new note above.',
          updatedAt: Date.now()
        },
        {
          id: '2',
          title: 'Core Features',
          content: '• Create and edit notes\n• Search through notes instantly\n• Delete unwanted items\n• Clean Material UI design',
          updatedAt: Date.now()
        },
        {
          id: '3',
          title: 'Pro Tip',
          content: 'Hover over a note to see quick actions like edit and delete.',
          updatedAt: Date.now()
        }
      ];
      setNotes(initialNotes);
    }
  }, []);

  // Save notes to local storage
  useEffect(() => {
    localStorage.setItem('notewave_notes', JSON.stringify(notes));
  }, [notes]);

  const handleCreateNote = (newNoteData: { title: string; content: string }) => {
    const newNote: Note = {
      id: Math.random().toString(36).substr(2, 9),
      title: newNoteData.title,
      content: newNoteData.content,
      updatedAt: Date.now()
    };
    setNotes([newNote, ...notes]);
  };

  const handleUpdateNote = (updatedNote: Note) => {
    setNotes(notes.map(n => n.id === updatedNote.id ? updatedNote : n));
  };

  const handleDeleteNote = (id: string) => {
    setNotes(notes.filter(n => n.id !== id));
  };

  const handleEditNote = (note: Note) => {
    setEditingNote(note);
    setIsModalOpen(true);
  };

  const filteredNotes = notes.filter(n => 
    n.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
    n.content.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-background font-body">
      <Navbar onSearch={setSearchQuery} />
      
      <main className="container mx-auto py-8">
        <CreateNote onSave={handleCreateNote} />

        {filteredNotes.length > 0 ? (
          <div className="columns-1 sm:columns-2 lg:columns-3 xl:columns-4 gap-4 px-4 space-y-4">
            {filteredNotes.map((note) => (
              <div key={note.id} className="break-inside-avoid">
                <NoteCard 
                  note={note} 
                  onEdit={handleEditNote} 
                  onDelete={handleDeleteNote}
                />
              </div>
            ))}
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