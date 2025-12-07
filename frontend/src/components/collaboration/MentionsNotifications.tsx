import { useState, useEffect, useRef } from 'react';
import { Button } from '../ui/Button';
import {
  Bell,
  AtSign,
  Check,
  Settings,
  Volume2,
  VolumeX,
  Mail,
  MessageSquare
} from 'lucide-react';

interface Notification {
  id: string;
  type: 'mention' | 'comment' | 'assignment' | 'alert' | 'system';
  title: string;
  message: string;
  timestamp: string;
  is_read: boolean;
  priority: 'low' | 'medium' | 'high';
  action_url?: string;
  metadata?: {
    mentioned_by?: string;
    case_id?: string;
    comment_id?: string;
    [key: string]: any;
  };
}

interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
}

interface MentionsNotificationsProps {
  notifications: Notification[];
  users: User[];
  currentUserId: string;
  onNotificationClick?: (notification: Notification) => void;
  onMarkAsRead?: (notificationId: string) => void;
  onMarkAllAsRead?: () => void;
  onSendMention?: (userId: string, message: string) => void;
  soundEnabled?: boolean;
  onToggleSound?: () => void;
}

export function MentionsNotifications({
  notifications,
  users,
  currentUserId,
  onNotificationClick,
  onMarkAsRead,
  onMarkAllAsRead,
  onSendMention,
  soundEnabled = true,
  onToggleSound
}: MentionsNotificationsProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [mentionInput, setMentionInput] = useState('');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [showMentionComposer, setShowMentionComposer] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const unreadCount = notifications.filter(n => !n.is_read).length;

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'mention': return <AtSign className="h-4 w-4 text-blue-500" />;
      case 'comment': return <MessageSquare className="h-4 w-4 text-green-500" />;
      case 'assignment': return <Check className="h-4 w-4 text-purple-500" />;
      case 'alert': return <Bell className="h-4 w-4 text-amber-500" />;
      case 'system': return <Settings className="h-4 w-4 text-slate-500" />;
      default: return <Bell className="h-4 w-4 text-slate-500" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'border-l-red-500 bg-red-50 dark:bg-red-500/10';
      case 'medium': return 'border-l-amber-500 bg-amber-50 dark:bg-amber-500/10';
      case 'low': return 'border-l-green-500 bg-green-50 dark:bg-green-500/10';
      default: return 'border-l-slate-500 bg-slate-50 dark:bg-slate-500/10';
    }
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffMins < 1440) return `${Math.floor(diffMins / 60)}h ago`;
    return date.toLocaleDateString();
  };

  const handleSendMention = () => {
    if (selectedUser && mentionInput.trim()) {
      onSendMention?.(selectedUser.id, mentionInput.trim());
      setMentionInput('');
      setSelectedUser(null);
      setShowMentionComposer(false);
    }
  };

  const filteredUsers = users.filter(user => user.id !== currentUserId);

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Notification Bell */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
      >
        <Bell className="h-5 w-5 text-slate-600 dark:text-slate-400" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-96 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg shadow-lg z-50">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-slate-200 dark:border-slate-700">
            <h3 className="font-semibold text-slate-900 dark:text-slate-100">
              Notifications
            </h3>
            <div className="flex items-center gap-2">
              {onToggleSound && (
                <button
                  onClick={onToggleSound}
                  className="p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  {soundEnabled ? (
                    <Volume2 className="h-4 w-4 text-slate-500" />
                  ) : (
                    <VolumeX className="h-4 w-4 text-slate-500" />
                  )}
                </button>
              )}
              {unreadCount > 0 && onMarkAllAsRead && (
                <Button size="sm" variant="outline" onClick={onMarkAllAsRead}>
                  Mark all read
                </Button>
              )}
            </div>
          </div>

          {/* Mention Composer */}
          {showMentionComposer && (
            <div className="p-4 border-b border-slate-200 dark:border-slate-700">
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <AtSign className="h-4 w-4 text-blue-500" />
                  <span className="font-medium text-slate-900 dark:text-slate-100">
                    Mention someone
                  </span>
                </div>

                {/* User Selection */}
                <select
                  value={selectedUser?.id || ''}
                  onChange={(e) => {
                    const user = users.find(u => u.id === e.target.value);
                    setSelectedUser(user || null);
                  }}
                  className="w-full px-3 py-2 text-sm border border-slate-200 dark:border-slate-700 rounded bg-white dark:bg-slate-900"
                >
                  <option value="">Select a user...</option>
                  {filteredUsers.map(user => (
                    <option key={user.id} value={user.id}>
                      {user.name}
                    </option>
                  ))}
                </select>

                {/* Message Input */}
                <textarea
                  value={mentionInput}
                  onChange={(e) => setMentionInput(e.target.value)}
                  placeholder="Type your message..."
                  className="w-full px-3 py-2 text-sm border border-slate-200 dark:border-slate-700 rounded bg-white dark:bg-slate-900 resize-none"
                  rows={3}
                />

                {/* Actions */}
                <div className="flex justify-end gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      setShowMentionComposer(false);
                      setMentionInput('');
                      setSelectedUser(null);
                    }}
                  >
                    Cancel
                  </Button>
                  <Button
                    size="sm"
                    onClick={handleSendMention}
                    disabled={!selectedUser || !mentionInput.trim()}
                  >
                    <Mail className="h-3 w-3 mr-1" />
                    Send Mention
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Notifications List */}
          <div className="max-h-96 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="p-8 text-center text-slate-500">
                <Bell className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p>No notifications</p>
                <p className="text-sm mt-1">You're all caught up!</p>
              </div>
            ) : (
              <div className="divide-y divide-slate-200 dark:divide-slate-700">
                {notifications.map((notification) => (
                  <div
                    key={notification.id}
                    onClick={() => onNotificationClick?.(notification)}
                    className={`p-4 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors ${
                      !notification.is_read ? getPriorityColor(notification.priority) : ''
                    }`}
                  >
                    <div className="flex gap-3">
                      <div className="flex-shrink-0 mt-1">
                        {getNotificationIcon(notification.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h4 className="font-medium text-slate-900 dark:text-slate-100 text-sm">
                              {notification.title}
                            </h4>
                            <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                              {notification.message}
                            </p>
                            <p className="text-xs text-slate-500 mt-1">
                              {formatTimestamp(notification.timestamp)}
                            </p>
                          </div>
                          {!notification.is_read && (
                            <div className="flex-shrink-0 ml-2">
                              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                            </div>
                          )}
                        </div>

                        {/* Metadata */}
                        {notification.metadata && (
                          <div className="flex flex-wrap gap-1 mt-2">
                            {notification.metadata.mentioned_by && (
                              <span className="text-xs bg-blue-100 dark:bg-blue-500/20 text-blue-700 dark:text-blue-300 px-2 py-1 rounded">
                                Mentioned by {notification.metadata.mentioned_by}
                              </span>
                            )}
                            {notification.metadata.case_id && (
                              <span className="text-xs bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded">
                                Case: {notification.metadata.case_id.slice(0, 8)}
                              </span>
                            )}
                          </div>
                        )}

                        {/* Mark as read button */}
                        {!notification.is_read && onMarkAsRead && (
                          <div className="mt-2">
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={(e) => {
                                e.stopPropagation();
                                onMarkAsRead(notification.id);
                              }}
                              className="text-xs h-6"
                            >
                              Mark as read
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="p-4 border-t border-slate-200 dark:border-slate-700">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowMentionComposer(!showMentionComposer)}
              className="w-full"
            >
              <AtSign className="h-4 w-4 mr-1" />
              {showMentionComposer ? 'Cancel Mention' : 'Mention Someone'}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}