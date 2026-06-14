import React, { useState } from 'react';
import { Image, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SvgUri } from 'react-native-svg';
import { Trash2 } from 'lucide-react-native';

interface Note {
  id: string;
  name: string;
  avatar?: string;
  content: string;
  timestamp: string;
}

// Hardcoded sample notes — matches the web's placeholder behavior.
// Will be replaced once the backend ships.
const initialNotes: Note[] = [
  {
    id: '1',
    name: 'Maria Kelly',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Maria',
    content:
      'Please, do an interview stage immediately. The design division needs more new employee now',
    timestamp: '10 Jul, 2021 • 11:30 AM',
  },
  {
    id: '2',
    name: 'Maria Kelly',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Maria',
    content: 'Please, do an interview stage immediately.',
    timestamp: '10 Jul, 2021 • 10:30 AM',
  },
];

const employer = {
  name: 'Maria Kelly',
  avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Maria',
};

function formatNow(): string {
  const now = new Date();
  const date = now.toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
  const time = now.toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
  });
  return `${date} • ${time}`;
}

function NoteAvatar({ uri, name }: { uri?: string; name: string }) {
  const isSvg = uri?.includes('.svg') || uri?.includes('/svg');
  if (!uri) {
    return (
      <View className="w-9 h-9 rounded-full bg-app-gray-1 items-center justify-center">
        <Text className="text-sm font-semibold text-app-slate-1">
          {name[0]}
        </Text>
      </View>
    );
  }
  if (isSvg) {
    return (
      <View className="w-9 h-9 rounded-full overflow-hidden bg-app-gray-1">
        <SvgUri width="100%" height="100%" uri={uri} />
      </View>
    );
  }
  return (
    <Image source={{ uri }} className="w-9 h-9 rounded-full bg-app-gray-1" />
  );
}

function NoteCard({
  note,
  onDelete,
}: {
  note: Note;
  onDelete: (id: string) => void;
}) {
  return (
    <View className="rounded-2xl border border-app-border-2 bg-white p-3 mb-3">
      <View className="flex-row items-start">
        <NoteAvatar uri={note.avatar} name={note.name} />
        <View className="flex-1 ml-3 min-w-0">
          <View className="flex-row items-center justify-between">
            <View className="flex-1 min-w-0">
              <Text
                className="text-sm font-medium text-app-slate-1"
                numberOfLines={1}
              >
                {note.name}
              </Text>
              <Text className="text-xs text-app-text-3" numberOfLines={1}>
                {note.timestamp}
              </Text>
            </View>
            <TouchableOpacity
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              onPress={() => onDelete(note.id)}
              className="ml-2"
            >
              <Trash2 size={18} color="#EF4444" />
            </TouchableOpacity>
          </View>
          <Text className="mt-2 text-sm text-app-slate-1">{note.content}</Text>
        </View>
      </View>
    </View>
  );
}

export function ApplicationNotes() {
  const [notes, setNotes] = useState<Note[]>(initialNotes);
  const [newNote, setNewNote] = useState('');
  const [isAdding, setIsAdding] = useState(false);

  const handleAddNote = () => {
    if (!newNote.trim()) return;
    setNotes([
      ...notes,
      {
        id:
          typeof crypto !== 'undefined' && 'randomUUID' in crypto
            ? crypto.randomUUID()
            : `${Date.now()}-${Math.random().toString(36).slice(2)}`,
        name: employer.name,
        avatar: employer.avatar,
        content: newNote.trim(),
        timestamp: formatNow(),
      },
    ]);
    setNewNote('');
    setIsAdding(false);
  };

  const handleDeleteNote = (id: string) => {
    setNotes(notes.filter((n) => n.id !== id));
  };

  return (
    <View>
      <View className="flex-row items-center justify-between mb-3">
        <Text className="text-base font-semibold text-app-slate-1">Notes</Text>
        {isAdding ? (
          <TouchableOpacity
            onPress={() => {
              setIsAdding(false);
              setNewNote('');
            }}
            className="px-3 py-1.5 rounded-lg border border-app-border-2"
            activeOpacity={0.7}
          >
            <Text className="text-sm font-medium text-app-slate-1">Cancel</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            onPress={() => setIsAdding(true)}
            className="px-3 py-1.5 rounded-lg border border-app-border-2"
            activeOpacity={0.7}
          >
            <Text className="text-sm font-medium text-app-slate-1">
              + Add Notes
            </Text>
          </TouchableOpacity>
        )}
      </View>

      {notes.map((note) => (
        <NoteCard key={note.id} note={note} onDelete={handleDeleteNote} />
      ))}

      {isAdding && (
        <View className="rounded-2xl border border-app-border-2 bg-white p-3">
          <View className="flex-row items-center">
            <NoteAvatar uri={employer.avatar} name={employer.name} />
            <TextInput
              className="flex-1 ml-3 text-sm text-app-slate-1 p-0"
              placeholder="Write a note..."
              placeholderTextColor="#9CA3AF"
              value={newNote}
              onChangeText={setNewNote}
              autoFocus
              multiline
              onSubmitEditing={handleAddNote}
              returnKeyType="done"
            />
            <TouchableOpacity
              onPress={handleAddNote}
              disabled={!newNote.trim()}
              className="ml-2 px-3 py-1.5 rounded-lg bg-app-primary-1"
              activeOpacity={0.7}
              style={{ opacity: newNote.trim() ? 1 : 0.5 }}
            >
              <Text className="text-sm font-semibold text-white">Done</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </View>
  );
}
