"use client";

import * as React from "react";
import {
  BellIcon,
  FolderOpen,
  Database,
  CheckCircle2,
  FileSearch,
  FileCheck2,
  Inbox,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface Notification {
  id: string;
  title: string;
  message: string;
  unread?: boolean;
  time: string;
  timeForSorting: string;
  type:
    | "project"
    | "submittedDatabase"
    | "approvedDatabase"
    | "reviewdApr"
    | "approvedApr";
  database_id?: string;
  project_id?: string;
  apr_id?: string;
}

export interface NotificationMenuProps {
  notifications?: Array<Notification>;
  onNotificationClick?: (notification: Notification) => void;
}

// Helper to render descriptive operational indicator icons mapped to your workspace logic
const getNotificationIcon = (type: Notification["type"]) => {
  switch (type) {
    case "project":
      return <FolderOpen className="h-4 w-4 text-sky-500" />;
    case "submittedDatabase":
      return <Database className="h-4 w-4 text-amber-500" />;
    case "approvedDatabase":
      return <CheckCircle2 className="h-4 w-4 text-emerald-500" />;
    case "reviewdApr":
      return <FileSearch className="h-4 w-4 text-indigo-500" />;
    case "approvedApr":
      return <FileCheck2 className="h-4 w-4 text-purple-500" />;
    default:
      return <BellIcon className="h-4 w-4 text-muted-foreground" />;
  }
};

export const NotificationMenu = React.forwardRef<
  HTMLButtonElement,
  NotificationMenuProps
>(({ notifications, onNotificationClick }, ref) => {
  const unreadCount = notifications?.filter((n) => n.unread).length ?? 0;

  // Optimally sorted presentation copies following your layout logic
  const sortedNotifications = React.useMemo(() => {
    return [...(notifications ?? [])].sort((a, b) => {
      if (a.unread !== b.unread) {
        return a.unread ? -1 : 1;
      }
      return b.timeForSorting.localeCompare(a.timeForSorting);
    });
  }, [notifications]);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          ref={ref}
          size="icon"
          variant="ghost"
          className="text-muted-foreground relative h-9 w-9 rounded-full shadow-none hover:bg-muted/80 focus-visible:ring-ring focus-visible:ring-offset-2 transition-all"
          aria-label="Notifications"
        >
          <BellIcon className="h-4 w-4 text-foreground/80" aria-hidden="true" />
          {unreadCount > 0 && (
            <Badge
              variant="destructive"
              className="absolute -top-0.5 -right-0.5 h-4 w-4 rounded-full p-0 flex items-center justify-center text-[10px] font-bold bg-primary text-primary-foreground border-2 border-background animate-in zoom-in-50 duration-200 shadow-sm"
            >
              {unreadCount}
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align="end"
        className="w-80 sm:w-96 bg-popover border-border text-popover-foreground rounded-lg shadow-xl p-1"
      >
        <DropdownMenuLabel className="text-xs font-bold px-3 py-2 flex items-center justify-between">
          <span>Notifications</span>
          {unreadCount > 0 && (
            <span className="text-[10px] bg-primary/10 text-primary px-2 py-0.5 rounded-full font-semibold">
              {unreadCount} unread
            </span>
          )}
        </DropdownMenuLabel>

        <DropdownMenuSeparator className="bg-border/60" />

        <div className="max-h-[360px] overflow-y-auto space-y-0.5">
          {sortedNotifications.length > 0 ? (
            sortedNotifications.map((notification) => (
              <DropdownMenuItem
                key={notification.id}
                className={cn(
                  "flex items-start gap-3 p-3 cursor-pointer rounded-md transition-colors focus:bg-muted/80 focus:text-foreground",
                  notification.unread
                    ? "bg-primary/5 dark:bg-primary/10"
                    : "bg-transparent"
                )}
                onClick={() => {
                  if (onNotificationClick) {
                    onNotificationClick(notification);
                  }
                }}
              >
                {/* Visual Icon Node Wrapper */}
                <div className="h-7 w-7 shrink-0 rounded-full bg-background border border-border/60 flex items-center justify-center shadow-sm mt-0.5">
                  {getNotificationIcon(notification.type)}
                </div>

                {/* Content Copy Block */}
                <div className="flex-1 min-w-0 space-y-1">
                  <div className="flex items-start justify-between gap-2">
                    <p
                      className={cn(
                        "text-xs tracking-tight leading-tight truncate",
                        notification.unread
                          ? "font-bold text-foreground"
                          : "font-medium text-foreground/90"
                      )}
                    >
                      {notification.title}
                    </p>

                    {notification.unread && (
                      <div className="h-2 w-2 rounded-full bg-primary shrink-0 mt-1 shadow-sm" />
                    )}
                  </div>

                  <p className="text-[11px] text-muted-foreground leading-relaxed line-clamp-2 break-words">
                    {notification.message}
                  </p>

                  <p className="text-[10px] text-muted-foreground/70 font-medium tracking-wide">
                    {notification.time}
                  </p>
                </div>
              </DropdownMenuItem>
            ))
          ) : (
            <div className="flex flex-col items-center justify-center py-10 px-4 text-center gap-2">
              <Inbox className="h-6 w-6 text-muted-foreground/40 stroke-[1.5]" />
              <p className="text-xs text-muted-foreground">
                All caught up! No recent operational indicators.
              </p>
            </div>
          )}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
});

NotificationMenu.displayName = "NotificationMenu";

export default NotificationMenu;
