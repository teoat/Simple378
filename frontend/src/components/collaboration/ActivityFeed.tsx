import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import { Button } from '../ui/Button';
import {
  Activity,
  User,
  FileText,
  MessageSquare,
  AlertTriangle,
  CheckCircle,
  Clock,
  Filter,
  RefreshCw
} from 'lucide-react';

interface ActivityItem {
  id: string;
  type: 'comment' | 'file_upload' | 'status_change' | 'user_action' | 'alert' | 'completion';
  title: string;
  description: string;
  user: {
    id: string;
    name: string;
    avatar?: string;
  };
  timestamp: string;
  metadata?: {
    case_id?: string;
    file_name?: string;
    old_status?: string;
    new_status?: string;
    comment_count?: number;
    [key: string]: any;
  };
  is_read?: boolean;
}

interface ActivityFeedProps {
  activities: ActivityItem[];
  currentUserId: string;
  onActivityClick?: (activity: ActivityItem) => void;
  onMarkAsRead?: (activityId: string) => void;
  onRefresh?: () => void;
  isLoading?: boolean;
}

export function ActivityFeed({
  activities,
  currentUserId,
  onActivityClick,
  onMarkAsRead,
  onRefresh,
  isLoading = false
}: ActivityFeedProps) {
  const [filter, setFilter] = useState<'all' | 'unread' | 'mine'>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');

  // Filter activities based on current filters
  const filteredActivities = useMemo(() => {
    return activities.filter(activity => {
      // Read status filter
      if (filter === 'unread' && activity.is_read) return false;
      if (filter === 'mine' && activity.user.id !== currentUserId) return false;

      // Type filter
      if (typeFilter !== 'all' && activity.type !== typeFilter) return false;

      return true;
    });
  }, [activities, filter, typeFilter, currentUserId]);

  // Group activities by date
  const groupedActivities = useMemo(() => {
    const groups: { [date: string]: ActivityItem[] } = {};

    filteredActivities.forEach(activity => {
      const date = new Date(activity.timestamp).toDateString();
      if (!groups[date]) {
        groups[date] = [];
      }
      groups[date].push(activity);
    });

    // Sort dates in descending order
    return Object.entries(groups)
      .sort(([a], [b]) => new Date(b).getTime() - new Date(a).getTime());
  }, [filteredActivities]);

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'comment': return <MessageSquare className="h-4 w-4 text-blue-500" />;
      case 'file_upload': return <FileText className="h-4 w-4 text-green-500" />;
      case 'status_change': return <CheckCircle className="h-4 w-4 text-purple-500" />;
      case 'user_action': return <User className="h-4 w-4 text-slate-500" />;
      case 'alert': return <AlertTriangle className="h-4 w-4 text-amber-500" />;
      case 'completion': return <CheckCircle className="h-4 w-4 text-emerald-500" />;
      default: return <Activity className="h-4 w-4 text-slate-500" />;
    }
  };

  const getActivityColor = (type: string) => {
    switch (type) {
      case 'comment': return 'border-l-blue-500';
      case 'file_upload': return 'border-l-green-500';
      case 'status_change': return 'border-l-purple-500';
      case 'user_action': return 'border-l-slate-500';
      case 'alert': return 'border-l-amber-500';
      case 'completion': return 'border-l-emerald-500';
      default: return 'border-l-slate-500';
    }
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;

    return date.toLocaleDateString();
  };

  const unreadCount = activities.filter(a => !a.is_read).length;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Activity Feed
            {unreadCount > 0 && (
              <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                {unreadCount}
              </span>
            )}
          </CardTitle>
          <div className="flex items-center gap-2">
            {onRefresh && (
              <Button
                variant="outline"
                size="sm"
                onClick={onRefresh}
                disabled={isLoading}
              >
                <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
              </Button>
            )}
          </div>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-4 mt-4">
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-slate-500" />
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value as any)}
              className="px-2 py-1 text-sm border border-slate-200 dark:border-slate-700 rounded bg-white dark:bg-slate-900"
            >
              <option value="all">All Activities</option>
              <option value="unread">Unread Only</option>
              <option value="mine">My Activities</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-sm text-slate-600 dark:text-slate-400">Type:</span>
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="px-2 py-1 text-sm border border-slate-200 dark:border-slate-700 rounded bg-white dark:bg-slate-900"
            >
              <option value="all">All Types</option>
              <option value="comment">Comments</option>
              <option value="file_upload">File Uploads</option>
              <option value="status_change">Status Changes</option>
              <option value="user_action">User Actions</option>
              <option value="alert">Alerts</option>
              <option value="completion">Completions</option>
            </select>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <RefreshCw className="h-6 w-6 animate-spin text-slate-400" />
          </div>
        ) : filteredActivities.length === 0 ? (
          <div className="text-center py-8 text-slate-500">
            <Activity className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p>No activities found</p>
            <p className="text-sm mt-1">Try adjusting your filters</p>
          </div>
        ) : (
          <div className="space-y-6">
            {groupedActivities.map(([date, dayActivities]) => (
              <div key={date}>
                {/* Date Header */}
                <div className="flex items-center gap-2 mb-3">
                  <Clock className="h-4 w-4 text-slate-400" />
                  <span className="text-sm font-medium text-slate-600 dark:text-slate-400">
                    {new Date(date).toLocaleDateString('en-US', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </span>
                </div>

                {/* Activities for this date */}
                <div className="space-y-3">
                  {dayActivities.map((activity) => (
                    <div
                      key={activity.id}
                      onClick={() => onActivityClick?.(activity)}
                      className={`flex gap-3 p-3 rounded-lg border-l-4 cursor-pointer transition-colors ${
                        activity.is_read
                          ? 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800'
                          : 'bg-blue-50 dark:bg-blue-500/10 border-blue-500'
                      } ${getActivityColor(activity.type)}`}
                    >
                      {/* Activity Icon */}
                      <div className="flex-shrink-0 mt-1">
                        {getActivityIcon(activity.type)}
                      </div>

                      {/* Activity Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h4 className="font-medium text-slate-900 dark:text-slate-100 text-sm">
                              {activity.title}
                            </h4>
                            <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                              {activity.description}
                            </p>

                            {/* Metadata */}
                            {activity.metadata && (
                              <div className="flex flex-wrap gap-2 mt-2">
                                {activity.metadata.case_id && (
                                  <span className="text-xs bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded">
                                    Case: {activity.metadata.case_id.slice(0, 8)}
                                  </span>
                                )}
                                {activity.metadata.file_name && (
                                  <span className="text-xs bg-green-100 dark:bg-green-500/20 text-green-700 dark:text-green-300 px-2 py-1 rounded">
                                    {activity.metadata.file_name}
                                  </span>
                                )}
                                {activity.metadata.old_status && activity.metadata.new_status && (
                                  <span className="text-xs bg-purple-100 dark:bg-purple-500/20 text-purple-700 dark:text-purple-300 px-2 py-1 rounded">
                                    {activity.metadata.old_status} → {activity.metadata.new_status}
                                  </span>
                                )}
                              </div>
                            )}
                          </div>

                          {/* User and Timestamp */}
                          <div className="flex flex-col items-end gap-1 ml-3">
                            <div className="flex items-center gap-2">
                              {activity.user.avatar ? (
                                <img
                                  src={activity.user.avatar}
                                  alt={activity.user.name}
                                  className="w-6 h-6 rounded-full"
                                />
                              ) : (
                                <div className="w-6 h-6 bg-slate-200 dark:bg-slate-700 rounded-full flex items-center justify-center">
                                  <User className="w-3 h-3 text-slate-500" />
                                </div>
                              )}
                              <span className="text-xs text-slate-500">
                                {activity.user.name}
                              </span>
                            </div>
                            <span className="text-xs text-slate-400">
                              {formatTimestamp(activity.timestamp)}
                            </span>
                          </div>
                        </div>

                        {/* Mark as read button for unread items */}
                        {!activity.is_read && onMarkAsRead && (
                          <div className="mt-2">
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={(e) => {
                                e.stopPropagation();
                                onMarkAsRead(activity.id);
                              }}
                              className="text-xs h-6"
                            >
                              Mark as read
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}