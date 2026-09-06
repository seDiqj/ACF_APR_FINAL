"use client"

import { useState } from "react"
import { cn } from "@/lib/utils"

type Tab = {
  id: string
  title: string
  content: React.ReactNode
}

export function ChromeTabs({ tabs }: { tabs: Tab[] }) {
  const [active, setActive] = useState(tabs[0].id)

  return (
    <div className="w-full">
      {/* Tab strip */}
      <div className="relative bg-black px-2 pt-2 overflow-x-auto">
        <div className="flex items-end">
          {tabs.map((tab, index) => {
            const isActive = tab.id === active

            return (
              <div key={tab.id} className="relative flex items-end">
                <button
                  onClick={() => setActive(tab.id)}
                  className={cn(
                    "relative h-[34px] min-w-[160px] px-4 text-sm text-left",
                    "text-gray-300",
                    isActive && "z-10 text-white"
                  )}
                >
                  {/* SVG Shape */}
                  <svg
                    viewBox="0 0 160 34"
                    preserveAspectRatio="none"
                    className="absolute inset-0 w-full h-full"
                  >
                    <path
                      d="
                        M0,34
                        L0,10
                        Q0,0 10,0
                        L150,0
                        Q160,0 160,10
                        L160,34
                        L140,34
                        C136,34 134,30 130,30
                        L30,30
                        C26,30 24,34 20,34
                        Z
                      "
                      fill={isActive ? "#3b3b3b" : "#000000"}
                    />
                  </svg>

                  <span className="relative z-10 truncate">
                    {tab.title}
                  </span>
                </button>

                {/* Separator */}
                {index !== tabs.length - 1 && (
                  <span className="mx-[2px] mb-2 h-4 w-px bg-gray-500 opacity-70" />
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* Content */}
      <div className="bg-black p-4 text-white">
        {tabs.find((t) => t.id === active)?.content}
      </div>
    </div>
  )
}