'use client';
import { useState } from 'react';
import { Trash2 } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';

interface Note {
  id: string;
  name: string;
  avatar?: string;
  content: string;
  timestamp: string;
}

// Example initial notes (can be replaced with real data)
const initialNotes: Note[] = [
  {
    id: '1',
    name: 'Maria Kelly',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Maria', // Replace with actual avatar path
    content:
      'Please, do an interview stage immediately. The design division needs more new employee now',
    timestamp: '10 July, 2021 • 11:30 AM',
  },
  {
    id: '2',
    name: 'Maria Kelly',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Maria', // Replace with actual avatar path
    content: 'Please, do an interview stage immediately.',
    timestamp: '10 July, 2021 • 10:30 AM',
  },
];

import { useRef, useEffect } from 'react';

export default function ApplicationNotes() {
  const [notes, setNotes] = useState<Note[]>(initialNotes);
  const [newNote, setNewNote] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Simulate employer info (replace with real user info)
  const employer = {
    name: 'Maria Kelly',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Maria', // Replace with actual avatar path
  };

  const handleAddNote = () => {
    if (!newNote.trim()) return;
    const now = new Date();
    const timestamp = `${now.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    })} • ${now.toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
    })}`;
    setNotes([
      ...notes,
      {
        id: String(notes.length + 1),
        name: employer.name,
        avatar: employer.avatar,
        content: newNote,
        timestamp,
      },
    ]);
    setNewNote('');
    setIsAdding(false);
  };

  const handleDeleteNote = (id: string) => {
    setNotes(notes.filter((note) => note.id !== id));
  };

  useEffect(() => {
    if (isAdding && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isAdding]);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-2">
        <span className="font-semibold text-lg">Notes</span>
        {isAdding ? (
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setIsAdding(false);
              setNewNote('');
            }}
          >
            Cancel
          </Button>
        ) : (
          <Button variant="outline" size="sm" onClick={() => setIsAdding(true)}>
            + Add Notes
          </Button>
        )}
      </div>
      {notes.map((note) => (
        <Card key={note.id} className="shadow-none">
          <CardContent className="flex gap-3 py-4">
            <Avatar>
              {note.avatar ? (
                <AvatarImage src={note.avatar} alt={note.name} />
              ) : (
                <AvatarFallback>{note.name[0]}</AvatarFallback>
              )}
            </Avatar>
            <div className="flex-1">
              <div className="flex items-center gap-2 w-full justify-between">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-sm">{note.name}</span>
                  <span className="text-xs text-muted-foreground">
                    {note.timestamp}
                  </span>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-red-500 hover:bg-red-50"
                  aria-label="Delete note"
                  onClick={() => handleDeleteNote(note.id)}
                >
                  <Trash2 className="w-5 h-5" />
                </Button>
              </div>
              <div className="mt-1 text-sm">{note.content}</div>
            </div>
          </CardContent>
        </Card>
      ))}
      {isAdding && (
        <Card className="border-none shadow-none">
          <CardContent className="flex items-center gap-3 py-4">
            <Avatar>
              <AvatarImage src={employer.avatar} alt={employer.name} />
              <AvatarFallback>{employer.name[0]}</AvatarFallback>
            </Avatar>
            <Input
              className="flex-1"
              placeholder="Write a note..."
              value={newNote}
              onChange={(e) => setNewNote(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleAddNote();
                if (e.key === 'Escape') {
                  setIsAdding(false);
                  setNewNote('');
                }
              }}
              ref={inputRef}
            />
            <Button variant="default" size="sm" onClick={handleAddNote}>
              Done
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
