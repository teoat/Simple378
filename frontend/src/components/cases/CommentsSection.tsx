import { useState, useRef, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useWebSocket } from '../../hooks/useWebSocket';
import { api } from '../../lib/api';
import { Button } from '../ui/Button';
import { formatDistanceToNow } from 'date-fns'; // Assuming date-fns is available or use native intl
import { Send, Trash2, Reply, MoreVertical, AtSign } from 'lucide-react';
import toast from 'react-hot-toast';

interface Comment {
  id: string;
  case_id: string;
  user_id: string;
  user_name: string;
  user_avatar?: string;
  content: string;
  created_at: string;
  parent_id?: string;
  replies?: Comment[];
}

interface CommentsSectionProps {
  caseId: string;
}

// Helper to format date if date-fns not installed
function formatDate(dateString: string) {
  const date = new Date(dateString);
  const now = new Date();
  const diff = (now.getTime() - date.getTime()) / 1000;
  
  if (diff < 60) return 'just now';
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return date.toLocaleDateString();
}

export function CommentsSection({ caseId }: CommentsSectionProps) {
  const [newComment, setNewComment] = useState('');
  const [replyTo, setReplyTo] = useState<string | null>(null);
  const queryClient = useQueryClient();
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Fetch comments
  const { data: comments = [], isLoading } = useQuery({
    queryKey: ['comments', caseId],
    queryFn: () => api.getComments(caseId),
  });

  // Organize into threads
  const threads = comments.reduce((acc: Comment[], comment) => {
    if (!comment.parent_id) {
      acc.push({ ...comment, replies: [] });
    }
    return acc;
  }, []);

  comments.forEach(comment => {
    if (comment.parent_id) {
      const parent = threads.find(t => t.id === comment.parent_id);
      if (parent && parent.replies) {
        parent.replies.push(comment);
      }
    }
  });

  // Real-time updates
  useWebSocket(`/ws/cases/${caseId}`, {
    onMessage: (msg) => {
      if (msg.type === 'comment_added' || msg.type === 'comment_deleted') {
        queryClient.invalidateQueries({ queryKey: ['comments', caseId] });
      }
    }
  });

  // Mutations
  const addCommentMutation = useMutation({
    mutationFn: (data: { content: string; parentId?: string }) => 
      api.addComment(caseId, data.content, data.parentId),
    onSuccess: () => {
      setNewComment('');
      setReplyTo(null);
      toast.success('Comment added');
      queryClient.invalidateQueries({ queryKey: ['comments', caseId] });
    },
    onError: () => toast.error('Failed to add comment'),
  });

  const deleteMutation = useMutation({
    mutationFn: api.deleteComment,
    onSuccess: () => {
      toast.success('Comment deleted');
      queryClient.invalidateQueries({ queryKey: ['comments', caseId] });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    addCommentMutation.mutate({ content: newComment, parentId: replyTo || undefined });
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <div className="flex flex-col h-full bg-slate-50 dark:bg-slate-900/50 rounded-xl border border-slate-200 dark:border-slate-800">
      {/* Header */}
      <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center">
        <h3 className="font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-2">
          Comments 
          <span className="text-xs bg-slate-200 dark:bg-slate-800 px-2 py-0.5 rounded-full text-slate-600 dark:text-slate-400">
            {comments.length}
          </span>
        </h3>
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {isLoading ? (
          <div className="text-center text-slate-400 py-8">Loading discussion...</div>
        ) : threads.length === 0 ? (
          <div className="text-center text-slate-400 py-8 italic">No comments yet. Start the discussion!</div>
        ) : (
          threads.map(thread => (
            <div key={thread.id} className="animate-in fade-in slide-in-from-bottom-2">
              <CommentItem 
                comment={thread} 
                onReply={() => {
                  setReplyTo(thread.id);
                  textareaRef.current?.focus();
                }}
                onDelete={() => deleteMutation.mutate(thread.id)}
              />
              {thread.replies && thread.replies.length > 0 && (
                <div className="ml-8 mt-3 pl-4 border-l-2 border-slate-200 dark:border-slate-800 space-y-3">
                  {thread.replies.map(reply => (
                    <CommentItem 
                      key={reply.id} 
                      comment={reply} 
                      isReply
                      onReply={() => {
                         setReplyTo(thread.id); // Always reply to thread root for 1-level nesting
                         setReplyTo(thread.id); 
                         textareaRef.current?.focus();
                         setNewComment(`@${reply.user_name} `);
                      }}
                      onDelete={() => deleteMutation.mutate(reply.id)}
                    />
                  ))}
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* Input Area */}
      <div className="p-4 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 rounded-b-xl">
        {replyTo && (
           <div className="flex items-center justify-between text-xs text-blue-600 mb-2 bg-blue-50 dark:bg-blue-900/20 px-2 py-1 rounded">
             <span>Replying to thread...</span>
             <button onClick={() => { setReplyTo(null); setNewComment(''); }} className="hover:underline">Cancel</button>
           </div>
        )}
        <form onSubmit={handleSubmit} className="relative">
          <textarea
            ref={textareaRef}
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={replyTo ? "Write a reply..." : "Write a comment... (Use @ to mention)"}
            className="w-full bg-slate-100 dark:bg-slate-800 border-0 rounded-lg p-3 pr-12 resize-none focus:ring-2 focus:ring-blue-500 min-h-[80px] text-sm"
          />
          <div className="absolute right-2 bottom-2 flex gap-1">
             <button
               type="button"
               className="p-1.5 text-slate-400 hover:text-blue-500 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700 transition"
               title="Mention"
               onClick={() => setNewComment(prev => prev + '@')}
             >
               <AtSign className="h-4 w-4" />
             </button>
             <Button 
               type="submit" 
               size="sm" 
               className="rounded-lg h-8 px-3"
               disabled={!newComment.trim() || addCommentMutation.isPending}
             >
               <Send className="h-3 w-3 mr-1" />
               Send
             </Button>
          </div>
        </form>
        <p className="text-[10px] text-slate-400 mt-1 pl-1">
          Press Enter to send, Shift+Enter for new line
        </p>
      </div>
    </div>
  );
}

function CommentItem({ comment, isReply, onReply, onDelete }: { comment: Comment, isReply?: boolean, onReply: () => void, onDelete: () => void }) {
  const isMe = comment.user_id === 'current-user-id'; // TODO: Get from auth context

  return (
    <div className="group flex gap-3">
      <div className={`flex-shrink-0 ${isReply ? 'w-6 h-6' : 'w-8 h-8'} bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-xs`}>
        {comment.user_name.charAt(0)}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-0.5">
          <span className="font-semibold text-sm text-slate-800 dark:text-slate-200">{comment.user_name}</span>
          <span className="text-xs text-slate-400">{formatDate(comment.created_at)}</span>
        </div>
        <div className="text-sm text-slate-600 dark:text-slate-300 whitespace-pre-wrap leading-relaxed">
          {comment.content}
        </div>
        <div className="flex items-center gap-3 mt-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
          <button 
            onClick={onReply}
            className="text-xs font-medium text-slate-500 hover:text-blue-600 flex items-center gap-1"
          >
            <Reply className="h-3 w-3" /> Reply
          </button>
          {isMe && (
            <button 
              onClick={onDelete}
              className="text-xs font-medium text-slate-500 hover:text-red-600 flex items-center gap-1"
            >
              <Trash2 className="h-3 w-3" /> Delete
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
