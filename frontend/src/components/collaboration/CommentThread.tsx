import { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import { Button } from '../ui/Button';
import {
  MessageSquare,
  Send,
  User,
  Clock,
  Reply,
  MoreVertical,
  Edit,
  Trash2
} from 'lucide-react';

interface Comment {
  id: string;
  content: string;
  author: {
    id: string;
    name: string;
    avatar?: string;
  };
  created_at: string;
  updated_at?: string;
  parent_id?: string; // For threaded replies
  mentions?: string[]; // User IDs mentioned
  reactions?: { [emoji: string]: string[] }; // emoji -> user IDs
}

interface CommentThreadProps {
  comments: Comment[];
  currentUser: {
    id: string;
    name: string;
  };
  onAddComment: (content: string, parentId?: string) => void;
  onEditComment: (commentId: string, content: string) => void;
  onDeleteComment: (commentId: string) => void;
  onAddReaction: (commentId: string, emoji: string) => void;
  title?: string;
  maxDepth?: number;
}

export function CommentThread({
  comments,
  currentUser,
  onAddComment,
  onEditComment,
  onDeleteComment,
  onAddReaction,
  title = "Comments",
  maxDepth = 3
}: CommentThreadProps) {
  const [newComment, setNewComment] = useState('');
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [editingComment, setEditingComment] = useState<string | null>(null);
  const [editContent, setEditContent] = useState('');
  const [showEmojiPicker, setShowEmojiPicker] = useState<string | null>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Organize comments into threads
  const commentThreads = useMemo(() => {
    const threads: { [key: string]: Comment[] } = {};
    const topLevelComments: Comment[] = [];

    // First pass: identify top-level comments
    comments.forEach(comment => {
      if (!comment.parent_id) {
        topLevelComments.push(comment);
        threads[comment.id] = [comment];
      }
    });

    // Second pass: build threads
    comments.forEach(comment => {
      if (comment.parent_id && threads[comment.parent_id]) {
        threads[comment.parent_id].push(comment);
      }
    });

    // Sort threads by creation date
    Object.values(threads).forEach(thread => {
      thread.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
    });

    return { threads, topLevelComments };
  }, [comments]);

  const handleSubmitComment = () => {
    if (!newComment.trim()) return;

    onAddComment(newComment.trim(), replyingTo || undefined);
    setNewComment('');
    setReplyingTo(null);
  };

  const handleEditComment = (commentId: string) => {
    if (!editContent.trim()) return;

    onEditComment(commentId, editContent.trim());
    setEditingComment(null);
    setEditContent('');
  };

  const startEditing = (comment: Comment) => {
    setEditingComment(comment.id);
    setEditContent(comment.content);
  };

  const cancelEditing = () => {
    setEditingComment(null);
    setEditContent('');
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffHours = diffMs / (1000 * 60 * 60);

    if (diffHours < 1) {
      const diffMins = Math.floor(diffMs / (1000 * 60));
      return `${diffMins}m ago`;
    } else if (diffHours < 24) {
      return `${Math.floor(diffHours)}h ago`;
    } else {
      return date.toLocaleDateString();
    }
  };

  const renderComment = (comment: Comment, depth: number = 0) => {
    const isAuthor = comment.author.id === currentUser.id;
    const canEdit = isAuthor && depth < maxDepth;
    const canDelete = isAuthor;
    const hasReplies = commentThreads.threads[comment.id]?.length > 1;

    return (
      <div key={comment.id} className={`${depth > 0 ? 'ml-8 mt-3' : 'mt-4'}`}>
        <div className="flex gap-3">
          {/* Avatar */}
          <div className="flex-shrink-0">
            {comment.author.avatar ? (
              <img
                src={comment.author.avatar}
                alt={comment.author.name}
                className="w-8 h-8 rounded-full"
              />
            ) : (
              <div className="w-8 h-8 bg-slate-200 dark:bg-slate-700 rounded-full flex items-center justify-center">
                <User className="w-4 h-4 text-slate-500" />
              </div>
            )}
          </div>

          {/* Comment Content */}
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <span className="font-medium text-slate-900 dark:text-slate-100">
                {comment.author.name}
              </span>
              <span className="text-xs text-slate-500">
                {formatTimestamp(comment.created_at)}
              </span>
              {comment.updated_at && comment.updated_at !== comment.created_at && (
                <span className="text-xs text-slate-400">(edited)</span>
              )}
            </div>

            {/* Comment Text */}
            {editingComment === comment.id ? (
              <div className="space-y-2">
                <textarea
                  value={editContent}
                  onChange={(e) => setEditContent(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-slate-200 dark:border-slate-700 rounded bg-white dark:bg-slate-900 resize-none"
                  rows={3}
                  autoFocus
                />
                <div className="flex gap-2">
                  <Button size="sm" onClick={() => handleEditComment(comment.id)}>
                    Save
                  </Button>
                  <Button size="sm" variant="outline" onClick={cancelEditing}>
                    Cancel
                  </Button>
                </div>
              </div>
            ) : (
              <div className="text-slate-700 dark:text-slate-300 text-sm whitespace-pre-wrap">
                {comment.content}
              </div>
            )}

            {/* Reactions */}
            {comment.reactions && Object.keys(comment.reactions).length > 0 && (
              <div className="flex flex-wrap gap-1 mt-2">
                {Object.entries(comment.reactions).map(([emoji, userIds]) => (
                  <button
                    key={emoji}
                    onClick={() => onAddReaction(comment.id, emoji)}
                    className="flex items-center gap-1 px-2 py-1 text-xs bg-slate-100 dark:bg-slate-800 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700"
                  >
                    <span>{emoji}</span>
                    <span className="text-slate-600 dark:text-slate-400">{userIds.length}</span>
                  </button>
                ))}
              </div>
            )}

            {/* Actions */}
            {editingComment !== comment.id && (
              <div className="flex items-center gap-2 mt-2">
                {depth < maxDepth && (
                  <button
                    onClick={() => setReplyingTo(comment.id)}
                    className="text-xs text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 flex items-center gap-1"
                  >
                    <Reply className="w-3 h-3" />
                    Reply
                  </button>
                )}

                <button
                  onClick={() => setShowEmojiPicker(comment.id)}
                  className="text-xs text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
                >
                  👍
                </button>

                {(canEdit || canDelete) && (
                  <div className="relative">
                    <button className="text-xs text-slate-500 hover:text-slate-700 dark:hover:text-slate-300">
                      <MoreVertical className="w-3 h-3" />
                    </button>
                    {/* Dropdown menu would go here */}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Nested replies */}
        {hasReplies && commentThreads.threads[comment.id].slice(1).map(reply =>
          renderComment(reply, depth + 1)
        )}
      </div>
    );
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MessageSquare className="h-5 w-5" />
          {title}
          <span className="text-sm font-normal text-slate-500">
            ({comments.length} comments)
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {/* Comment Input */}
        <div className="mb-6">
          <div className="flex gap-3">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                <User className="w-4 h-4 text-white" />
              </div>
            </div>
            <div className="flex-1">
              <textarea
                ref={inputRef}
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder={replyingTo ? "Write a reply..." : "Add a comment..."}
                className="w-full px-3 py-2 text-sm border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-900 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows={3}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
                    handleSubmitComment();
                  }
                }}
              />
              <div className="flex items-center justify-between mt-2">
                <div className="text-xs text-slate-500">
                  {replyingTo && (
                    <span>
                      Replying to comment •{' '}
                      <button
                        onClick={() => setReplyingTo(null)}
                        className="text-blue-500 hover:underline"
                      >
                        Cancel
                      </button>
                    </span>
                  )}
                  {!replyingTo && "Press Ctrl+Enter to submit"}
                </div>
                <Button
                  size="sm"
                  onClick={handleSubmitComment}
                  disabled={!newComment.trim()}
                >
                  <Send className="h-3 w-3 mr-1" />
                  {replyingTo ? 'Reply' : 'Comment'}
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Comments List */}
        <div className="space-y-1">
          {commentThreads.topLevelComments.length === 0 ? (
            <div className="text-center py-8 text-slate-500">
              <MessageSquare className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p>No comments yet</p>
              <p className="text-sm mt-1">Be the first to add a comment</p>
            </div>
          ) : (
            commentThreads.topLevelComments.map(comment => renderComment(comment))
          )}
        </div>
      </CardContent>
    </Card>
  );
}