"use client";

import * as React from "react";
import { useEffect, useId, useState } from "react";
import NotificationMenu from "./NotificationMenu";
import SettingsMenu from "./SettingsMenu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";
import { SidebarTrigger } from "../../sidebar";
import { useTheme } from "next-themes";
import { useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { useParentContext } from "@/contexts/ParentContext";
import SubmitSummary from "../submitSummary";
import { webSiteContentList } from "@/constants/SingleAndMultiSelectOptionsList";
import { Navbar14Props, Notification } from "@/interfaces/Interfaces";
import { SIDEBAR_OPEN_TOGGLER_PROVIDER } from "@/config/System";
import { Search, Moon, Sun } from "lucide-react";

export const Navbar14 = React.forwardRef<HTMLElement, Navbar14Props>(
  (
    {
      className,
      searchPlaceholder = "Search page context...",
      searchValue,
      showTestMode = true,
      onSearchChange,
      onLayoutClick,
      onInfoItemClick,
      ...props
    },
    ref
  ) => {
    const {
      notifications,
      setNotifications,
      requestHandler,
      reqForToastAndSetMessage,
    } = useParentContext();

    const router = useRouter();
    const id = useId();
    const { theme, setTheme } = useTheme();

    const [mounted, setMounted] = useState(false);
    const [searchQuery, setSearchQuery] = useState(searchValue || "");
    const [searchResults, setSearchResults] = useState<
      { contentTitle: string; contentUrl: string }[]
    >([]);

    const [reqForSubmittedDatabaseSummary, setReqForSubmittedDatabaseSummary] =
      useState<boolean>(false);
    const [databaseId, setDatabaseId] = useState<string | null>(null);

    useEffect(() => {
      setMounted(true);
    }, []);

    if (!mounted) return null;

    const isDark: boolean = theme === "dark";

    const handleGlobalSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value;
      setSearchQuery(value);

      if (!value) {
        setSearchResults([]);
        return;
      }

      const filtered = webSiteContentList.filter((item) =>
        item.contentTitle.toLowerCase().includes(value.toLowerCase())
      );
      setSearchResults(filtered);
      onSearchChange?.(value);
    };

    const onNotificationClick = (notification: Notification) => {
      if (notification.unread) {
        requestHandler()
          .post(`/notification/mark_as_read/${notification.id}`)
          .then(() =>
            setNotifications((prev: Notification[]) =>
              prev.map((n) =>
                n.id === notification.id ? { ...n, unread: false } : n
              )
            )
          )
          .catch((error: any) =>
            reqForToastAndSetMessage(
              error.response?.data?.message || "Error status update",
              "error"
            )
          );
      }

      if (notification.apr_id) setDatabaseId(notification.apr_id);

      switch (notification.type) {
        case "project":
          if (notification.project_id) {
            router.push(`/projects/project_show/${notification.project_id}`);
          }
          break;
        case "submittedDatabase":
        case "approvedDatabase":
        case "reviewdApr":
        case "approvedApr":
          setReqForSubmittedDatabaseSummary(true);
          break;
      }
    };
    return (
      <header
        ref={ref}
        className={cn(
          "border-b border-border bg-card text-card-foreground px-6 sticky top-0 z-40 backdrop-blur-md bg-opacity-95 shadow-sm transition-colors duration-300 [&_*]:no-underline",
          className
        )}
        {...props}
      >
        <div className="flex h-16 items-center w-full justify-between gap-6">
          {/* Left Block: Workspace Activation & Search Engine */}
          <div className="relative flex-1 max-w-sm flex items-center gap-3">
            <SidebarTrigger
              id={SIDEBAR_OPEN_TOGGLER_PROVIDER}
              className="text-muted-foreground hover:text-foreground hover:bg-muted/80 rounded-md transition-all shrink-0"
            />

            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
              <Input
                id={`input-${id}`}
                className="peer h-9 w-full pl-8 pr-3 bg-background border-input text-foreground focus-visible:ring-ring rounded-md text-xs"
                placeholder={searchPlaceholder}
                type="search"
                value={searchQuery}
                onChange={handleGlobalSearch}
              />

              {/* Dynamic Dropdown for Live Results */}
              {searchResults.length > 0 && (
                <Card className="absolute top-full left-0 mt-2 w-full max-h-64 overflow-y-auto z-50 border border-border bg-popover text-popover-foreground shadow-lg rounded-md animate-in fade-in slide-in-from-top-1 duration-200">
                  <CardContent className="p-1 space-y-0.5">
                    {searchResults.map((item, idx) => (
                      <div
                        key={idx}
                        className="px-3 py-2 text-xs font-medium hover:bg-muted rounded-md cursor-pointer transition-colors text-foreground/90 hover:text-foreground"
                        onClick={() => {
                          setSearchQuery("");
                          setSearchResults([]);
                          router.push(item.contentUrl);
                        }}
                      >
                        {item.contentTitle}
                      </div>
                    ))}
                  </CardContent>
                </Card>
              )}
            </div>
          </div>

          {/* Right Block: Dynamic Status Mode Controls */}
          <div className="flex items-center gap-4 shrink-0">
            {showTestMode && (
              <div className="inline-flex items-center gap-2 max-md:hidden border border-border/50 bg-muted/20 px-3 py-1.5 rounded-md shadow-sm">
                <div className="flex items-center gap-1.5 text-muted-foreground text-xs font-semibold">
                  {isDark ? (
                    <Moon className="h-3.5 w-3.5 text-primary" />
                  ) : (
                    <Sun className="h-3.5 w-3.5 text-amber-500" />
                  )}
                  <Label
                    htmlFor={`switch-${id}`}
                    className="cursor-pointer select-none"
                  >
                    Dark Mode
                  </Label>
                </div>
                <Switch
                  id={`switch-${id}`}
                  checked={isDark}
                  onCheckedChange={() => setTheme(isDark ? "light" : "dark")}
                  className="data-[state=checked]:bg-primary rounded-full transition-all focus-visible:ring-ring"
                  aria-label="Toggle dark mode"
                />
              </div>
            )}

            <div className="flex items-center border-l pl-4 border-border/60">
              <NotificationMenu
                notifications={notifications}
                onNotificationClick={onNotificationClick}
              />
            </div>
          </div>

          {/* Conditional Detail Metric Summary Modals */}
          {reqForSubmittedDatabaseSummary && databaseId && (
            <SubmitSummary
              open={reqForSubmittedDatabaseSummary}
              onOpenChange={setReqForSubmittedDatabaseSummary}
              databaseId={databaseId}
            />
          )}
        </div>
      </header>
    );
  }
);

Navbar14.displayName = "Navbar14";

export { NotificationMenu, SettingsMenu };
