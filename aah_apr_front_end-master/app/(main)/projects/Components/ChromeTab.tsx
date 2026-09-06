"use client";

// CUSTOM CHROME LIKE TABS.

import React, { useState, useEffect, useRef } from "react";
import { Pencil, Trash2 } from "lucide-react";

interface Tab {
  id: number;
  value: string;
  title: string | React.ReactNode;
  icon?: React.ReactNode;
  hoverTitle?: string;
  onEditTab?: (id: number) => void;
  onDeleteTab?: (id: number) => void;
}

interface InputTab {
  value: string;
  title: string | React.ReactNode;
  icon?: React.ReactNode;
  hoverTitle?: string;
  onEditTab?: (id: number) => void;
  onDeleteTab?: (id: number) => void;
}

interface ChromeTabsProps {
  currentTab: string;
  onCurrentTabChange: (value: string) => void;
  initialTabs: InputTab[];
}

const ChromeTabs: React.FC<ChromeTabsProps> = ({
  initialTabs,
  currentTab,
  onCurrentTabChange,
}) => {
  const [tabs, setTabs] = useState<Tab[]>(
    initialTabs.map((tab, index) => ({ id: index, ...tab }))
  );

  const [activeTabId, setActiveTabId] = useState<number>(
    initialTabs[0] ? 0 : 0
  );

  const [contextMenu, setContextMenu] = useState<{
    x: number;
    y: number;
    tab: Tab;
  } | null>(null);

  const divRef = useRef<HTMLDivElement | null>(null);

  /* Sync tabs with props */
  useEffect(() => {
    setTabs(initialTabs.map((tab, index) => ({ id: index, ...tab })));
  }, [initialTabs]);

  /* Sync active tab */
  useEffect(() => {
    const found = tabs.find((tab) => tab.value === currentTab);
    if (found) setActiveTabId(found.id);
  }, [currentTab, tabs]);

  /* Close context menu on outside click */
  useEffect(() => {
    const closeMenu = () => setContextMenu(null);

    window.addEventListener("click", closeMenu);

    return () => window.removeEventListener("click", closeMenu);
  }, []);

  return (
    <div className="relative flex flex-col max-w-full min-h-[40px] bg-background rounded-lg pt-1 overflow-x-auto">
      {/* Tabs */}
      <div className="flex w-full overflow-x-auto whitespace-nowrap z-1">
        {tabs.map((tab) => {
          const isActive = activeTabId === tab.id;
          const isPrevActive = activeTabId - 1 === tab.id;
          const isNextActive = activeTabId + 1 === tab.id;
          const isLastActive = isActive && tab.id === tabs.length - 1;

          return (
            <div
              key={tab.id}
              className={`relative w-full cursor-pointer ${
                isActive ? "z-10" : ""
              }`}
              title={tab.hoverTitle}
              onContextMenu={(e) => {
                e.preventDefault();

                setContextMenu({
                  x: e.clientX,
                  y: e.clientY,
                  tab,
                });
              }}
            >
              <div
                onClick={() => {
                  setActiveTabId(tab.id);
                  onCurrentTabChange(tab.value);
                }}
                className={`
                  flex items-center gap-1 px-4 py-1 text-center transition-all
                  ${
                    isActive
                      ? "bg-primary text-white rounded-t-lg"
                      : "bg-gray-400 hover:bg-gray-300 text-black"
                  }
                  ${isLastActive ? "rounded-r-lg" : ""}
                  ${isPrevActive ? "rounded-r-lg" : ""}
                  ${isNextActive ? "rounded-l-lg" : ""}
                `}
              >
                {tab.icon && <span className="text-gray-700">{tab.icon}</span>}

                <span className="mx-auto w-full text-md">{tab.title}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Bottom Bar */}
      <div className="absolute top-7 w-full h-3 bg-primary z-0" ref={divRef} />

      {/* Context Menu */}
      {contextMenu &&
        (contextMenu.tab.onDeleteTab || contextMenu.tab.onEditTab) && (
          <div
            className="
              fixed
              z-50
              w-44
              overflow-hidden
              rounded-lg
              border
              border-border
              bg-popover
              p-1
              text-popover-foreground
              shadow-lg
              shadow-black/10
              animate-in
              fade-in-0
              zoom-in-95
              duration-100
            "
            style={{
              top: contextMenu.y,
              left: contextMenu.x,
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Edit */}
            {contextMenu.tab.onEditTab && (
              <button
                type="button"
                className="
                  flex
                  w-full
                  items-center
                  gap-2.5
                  rounded-md
                  px-3
                  py-2
                  text-sm
                  font-medium
                  text-foreground
                  transition-colors
                  hover:bg-accent
                  hover:text-accent-foreground
                "
                onClick={() => {
                  const tab = contextMenu.tab;

                  if (tab.onEditTab) {
                    tab.onEditTab(tab.id);
                  }

                  setContextMenu(null);
                }}
              >
                <Pencil className="h-4 w-4 text-muted-foreground" />

                <span>Edit</span>
              </button>
            )}

            {/* Delete */}
            {contextMenu.tab.onDeleteTab && (
              <button
                type="button"
                className="
                  flex
                  w-full
                  items-center
                  gap-2.5
                  rounded-md
                  px-3
                  py-2
                  text-sm
                  font-medium
                  text-destructive
                  transition-colors
                  hover:bg-destructive/10
                "
                onClick={() => {
                  const tab = contextMenu.tab;

                  if (tab.onDeleteTab) {
                    tab.onDeleteTab(tab.id);
                  }

                  setContextMenu(null);
                }}
              >
                <Trash2 className="h-4 w-4" />

                <span>Delete</span>
              </button>
            )}
          </div>
        )}
    </div>
  );
};

export default ChromeTabs;
