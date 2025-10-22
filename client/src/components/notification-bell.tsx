import { Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useQuery, useMutation } from "@tanstack/react-query";
import type { Notification } from "@shared/schema";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";

export function NotificationBell() {
  const { data: unreadNotifications = [] } = useQuery<Notification[]>({
    queryKey: ['/api/notifications/unread'],
    refetchInterval: 30000, // Poll every 30 seconds
  });

  const markAsRead = useMutation({
    mutationFn: async (id: string) => {
      return await apiRequest(`/api/notifications/${id}/read`, {
        method: 'PATCH',
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/notifications/unread'] });
      queryClient.invalidateQueries({ queryKey: ['/api/notifications'] });
    },
  });

  const markAllAsRead = useMutation({
    mutationFn: async () => {
      return await apiRequest('/api/notifications/mark-all-read', {
        method: 'POST',
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/notifications/unread'] });
      queryClient.invalidateQueries({ queryKey: ['/api/notifications'] });
    },
  });

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'CRITICAL':
        return 'text-destructive';
      case 'WARNING':
        return 'text-orange-500';
      default:
        return 'text-muted-foreground';
    }
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button 
          variant="ghost" 
          size="icon" 
          className="relative"
          data-testid="button-notifications"
        >
          <Bell className="h-5 w-5" />
          {unreadNotifications.length > 0 && (
            <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-destructive text-xs text-destructive-foreground">
              {unreadNotifications.length > 9 ? '9+' : unreadNotifications.length}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-96 p-0" align="end">
        <div className="flex items-center justify-between p-4 border-b border-border">
          <h3 className="text-sm font-semibold text-foreground">Notifications</h3>
          {unreadNotifications.length > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => markAllAsRead.mutate()}
              data-testid="button-mark-all-read"
            >
              Mark all read
            </Button>
          )}
        </div>
        <ScrollArea className="h-[400px]">
          {unreadNotifications.length === 0 ? (
            <div className="p-8 text-center text-sm text-muted-foreground">
              No new notifications
            </div>
          ) : (
            <div className="divide-y divide-border">
              {unreadNotifications.map((notification) => (
                <div
                  key={notification.id}
                  className="p-4 hover-elevate cursor-pointer"
                  onClick={() => {
                    markAsRead.mutate(notification.id);
                    if (notification.actionUrl) {
                      window.location.href = notification.actionUrl;
                    }
                  }}
                  data-testid={`notification-${notification.id}`}
                >
                  <div className="flex items-start gap-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="text-sm font-medium text-foreground">
                          {notification.title}
                        </p>
                        <Badge 
                          variant="outline" 
                          className={`text-xs ${getSeverityColor(notification.severity)}`}
                        >
                          {notification.severity}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {notification.message}
                      </p>
                      {notification.ticker && (
                        <p className="text-xs text-muted-foreground mt-1">
                          {notification.ticker}
                        </p>
                      )}
                      <p className="text-xs text-muted-foreground mt-1">
                        {new Date(notification.createdAt!).toLocaleString()}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </PopoverContent>
    </Popover>
  );
}
