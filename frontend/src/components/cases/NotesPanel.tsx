import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Plus, User, ThumbsUp, MessageCircle, Paperclip, AtSign } from 'lucide-react';
import { cn } from '../../lib/utils';

interface Note {
  id: string;
  author: string;
  content: string;
  timestamp: Date;
  reactions: { emoji: string; count: number; users: string[] }[];
  mentions: string[];
  attachments?: { name: string; type: string; url: string }[];
}

interface NotesPanelProps {
  caseId: string;
}

export function NotesPanel({ caseId }: NotesPanelProps) {
  const [notes, setNotes] = useState<Note[]>([
    {
      id: '1',
      author: 'Sarah Kim',
      content: 'Found another mirroring pattern in Feb data. This one involves PT ABC → CV XYZ → back to PT ABC. Total cycle: Rp 850M',
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
      reactions: [
        { emoji: '👍', count: 2, users: ['Mike Rodriguez', 'John Doe'] }
      ],
      mentions: ['MikeR'],
      attachments: []
    },
    {
      id: '2',
      author: 'Mike Rodriguez',
      content: 'Confirmed: CV XYZ shares the same address as PT ABC\'s registered office. This is definitely a shell company setup.',
      timestamp: new Date(Date.now() - 1 * 60 * 60 * 1000), // 1 hour ago
      reactions: [
        { emoji: '👍', count: 3, users: ['Sarah Kim', 'John Doe', 'Jane Smith'] }
      ],
      mentions: [],
      attachments: [
        { name: 'company_registration.pdf', type: 'pdf', url: '#' },
        { name: 'address_verification.jpg', type: 'image', url: '#' }
      ]
    },
    {
      id: '3',
      author: 'AI Assistant',
      content: 'Based on the evidence, this matches Pattern #47 in our fraud database: "Shell Company Diversion". Similar cases have resulted in 85% conviction rate. Recommend escalating to legal team.',
      timestamp: new Date(Date.now() - 30 * 60 * 1000), // 30 minutes ago
      reactions: [
        { emoji: '👍', count: 1, users: ['Sarah Kim'] }
      ],
      mentions: [],
      attachments: []
    }
  ]);

  const [newNote, setNewNote] = useState('');
  const [showMentions, setShowMentions] = useState(false);
  const [mentionSearch, setMentionSearch] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const teamMembers = ['Sarah Kim', 'Mike Rodriguez', 'John Doe', 'Jane Smith', 'AI Assistant'];

  const handleSendNote = () => {
    if (!newNote.trim()) return;

    const note: Note = {
      id: Date.now().toString(),
      author: 'Current User', // In real app, get from auth context
      content: newNote,
      timestamp: new Date(),
      reactions: [],
      mentions: extractMentions(newNote),
      attachments: []
    };

    setNotes(prev => [note, ...prev]);
    setNewNote('');
  };

  const extractMentions = (content: string): string[] => {
    const mentionRegex = /@(\w+)/g;
    const matches = content.match(mentionRegex);
    return matches ? matches.map(match => match.slice(1)) : [];
  };

  const handleReaction = (noteId: string, emoji: string) => {
    setNotes(prev => prev.map(note => {
      if (note.id === noteId) {
        const existingReaction = note.reactions.find(r => r.emoji === emoji);
        if (existingReaction) {
          // Remove user's reaction
          const updatedUsers = existingReaction.users.filter(u => u !== 'Current User');
          if (updatedUsers.length === 0) {
            return {
              ...note,
              reactions: note.reactions.filter(r => r.emoji !== emoji)
            };
          } else {
            return {
              ...note,
              reactions: note.reactions.map(r =>
                r.emoji === emoji
                  ? { ...r, count: r.count - 1, users: updatedUsers }
                  : r
              )
            };
          }
        } else {
          // Add new reaction
          return {
            ...note,
            reactions: [...note.reactions, { emoji, count: 1, users: ['Current User'] }]
          };
        }
      }
      return note;
    }));
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      handleSendNote();
    } else if (e.key === '@') {
      setShowMentions(true);
    } else if (e.key === 'Escape') {
      setShowMentions(false);
    }
  };

  const insertMention = (member: string) => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const cursorPos = textarea.selectionStart;
    const beforeCursor = newNote.slice(0, cursorPos);
    const afterCursor = newNote.slice(cursorPos);

    // Find the @ symbol before cursor
    const atIndex = beforeCursor.lastIndexOf('@');
    if (atIndex !== -1) {
      const newText = beforeCursor.slice(0, atIndex) + `@${member} ` + afterCursor;
      setNewNote(newText);
      setShowMentions(false);

      // Focus back to textarea and set cursor position
      setTimeout(() => {
        textarea.focus();
        textarea.setSelectionRange(atIndex + member.length + 2, atIndex + member.length + 2);
      }, 0);
    }
  };

  const filteredMembers = teamMembers.filter(member =>
    member.toLowerCase().includes(mentionSearch.toLowerCase()) &&
    member !== 'Current User'
  );

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-slate-900 dark:text-white">
          Investigation Notes
        </h2>
        <button className="flex items-center gap-2 px-3 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium">
          <Plus className="h-4 w-4" />
          Add Note
        </button>
      </div>

      {/* Notes Feed */}
      <div className="flex-1 overflow-y-auto space-y-4 mb-4">
        <AnimatePresence>
          {notes.map((note) => (
            <motion.div
              key={note.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="bg-slate-50 dark:bg-slate-800/50 rounded-lg p-4 border border-slate-200 dark:border-slate-700"
            >
              {/* Note Header */}
              <div className="flex items-center gap-3 mb-3">
                <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/50 rounded-full flex items-center justify-center">
                  <User className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-slate-900 dark:text-white">
                      {note.author}
                    </span>
                    <span className="text-xs text-slate-500 dark:text-slate-400">
                      {note.timestamp.toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>

              {/* Note Content */}
              <div className="text-slate-700 dark:text-slate-300 mb-3 whitespace-pre-wrap">
                {note.content}
              </div>

              {/* Attachments */}
              {note.attachments && note.attachments.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-3">
                  {note.attachments.map((attachment, index) => (
                    <a
                      key={index}
                      href={attachment.url}
                      className="flex items-center gap-2 px-3 py-1 bg-slate-100 dark:bg-slate-700 rounded-lg text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors"
                    >
                      <Paperclip className="h-3 w-3" />
                      {attachment.name}
                    </a>
                  ))}
                </div>
              )}

              {/* Reactions */}
              <div className="flex items-center gap-2">
                {note.reactions.map((reaction, index) => (
                  <button
                    key={index}
                    onClick={() => handleReaction(note.id, reaction.emoji)}
                    className={cn(
                      "flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium transition-colors",
                      reaction.users.includes('Current User')
                        ? "bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300"
                        : "bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-600"
                    )}
                  >
                    <span>{reaction.emoji}</span>
                    <span>{reaction.count}</span>
                  </button>
                ))}

                <button
                  onClick={() => handleReaction(note.id, '👍')}
                  className="flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors"
                >
                  <ThumbsUp className="h-3 w-3" />
                  Like
                </button>

                <button className="flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors">
                  <MessageCircle className="h-3 w-3" />
                  Reply
                </button>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* New Note Input */}
      <div className="border-t border-slate-200 dark:border-slate-700 pt-4">
        <div className="relative">
          <textarea
            ref={textareaRef}
            value={newNote}
            onChange={(e) => {
              setNewNote(e.target.value);
              const cursorPos = e.target.selectionStart;
              const textBeforeCursor = e.target.value.slice(0, cursorPos);
              const atIndex = textBeforeCursor.lastIndexOf('@');
              if (atIndex !== -1 && cursorPos > atIndex) {
                const searchText = textBeforeCursor.slice(atIndex + 1);
                setMentionSearch(searchText);
                setShowMentions(searchText.length > 0);
              } else {
                setShowMentions(false);
              }
            }}
            onKeyDown={handleKeyPress}
            placeholder="Add a note... Use @ to mention team members. Ctrl+Enter to send."
            className="w-full px-4 py-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
            rows={3}
          />

          {/* Mentions Dropdown */}
          <AnimatePresence>
            {showMentions && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="absolute bottom-full left-0 right-0 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg shadow-lg z-10 max-h-40 overflow-y-auto"
              >
                {filteredMembers.map((member) => (
                  <button
                    key={member}
                    onClick={() => insertMention(member)}
                    className="w-full px-4 py-2 text-left hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors flex items-center gap-2"
                  >
                    <AtSign className="h-4 w-4 text-slate-400" />
                    <span className="text-slate-900 dark:text-white">{member}</span>
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="flex items-center justify-between mt-3">
          <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
            <kbd className="px-2 py-1 bg-slate-100 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded text-xs">Ctrl</kbd>
            <span>+</span>
            <kbd className="px-2 py-1 bg-slate-100 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded text-xs">Enter</kbd>
            <span>to send</span>
          </div>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleSendNote}
            disabled={!newNote.trim()}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
          >
            <Send className="h-4 w-4" />
            Send
          </motion.button>
        </div>
      </div>
    </div>
  );
}