"use client";

import { useState, useEffect, useRef } from "react";
import {
  Tabs as ShadcnTabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from "@/components/ui/tabs";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableCell,
  TableHead,
} from "@/components/ui/table";
import AddBeneInCDProfile from "@/components/ui/shadcn-io/AddBeneInCDProfile";

interface TabsProps {
  tabs: string[];
}

export default function Tabs({ tabs }: TabsProps) {
  const [activeTab, setActiveTab] = useState(tabs[0]);
  const [underlineStyle, setUnderlineStyle] = useState<{ left: number; width: number }>({ left: 0, width: 0 });
  const tabRefs = useRef<{ [key: string]: HTMLButtonElement | null }>({});

  // Dummy data
  const sessionsData = [
    { session: 1, topic: "Health Awareness", date: "2025-09-19" },
    { session: 2, topic: "Education Awareness", date: "2025-09-20" },
    { session: 3, topic: "Nutrition Awareness", date: "2025-09-21" },
  ];

  const beneficiariesData = [
    { id: 1, name: "Alice Johnson", age: 25, gender: "Female" },
    { id: 2, name: "Bob Smith", age: 30, gender: "Male" },
    { id: 3, name: "Charlie Lee", age: 22, gender: "Male" },
  ];

  useEffect(() => {
    const currentTab = tabRefs.current[activeTab];
    if (currentTab) {
      setUnderlineStyle({
        left: currentTab.offsetLeft,
        width: currentTab.offsetWidth,
      });
    }
  }, [activeTab, tabs]);

  return (
    <div className="w-full overflow-x-auto">
      <ShadcnTabs value={activeTab} onValueChange={setActiveTab}>
        {/* Tabs header */}
        <div className="relative border-b border-border w-fit mb-2">
          <TabsList className="flex justify-start gap-4 bg-transparent p-0 w-fit [&>*]:flex-none">
            {tabs.map((tab) => (
              <TabsTrigger
                key={tab}
                value={tab}
                ref={(el: HTMLButtonElement | null) => {
                  tabRefs.current[tab] = el;
                }}
                className="px-3 py-1 text-sm text-muted-foreground hover:text-foreground transition-colors data-[state=active]:text-foreground data-[state=active]:font-semibold"
              >
                {tab}
              </TabsTrigger>
            ))}
          </TabsList>

          {/* Animated underline */}
          <span
            className="absolute bottom-0 h-[2px] bg-black dark:bg-white rounded-t-md transition-all duration-300 ease-in-out"
            style={{ left: underlineStyle.left, width: underlineStyle.width }}
          />
        </div>

        {/* Tab content */}
        {tabs.map((tab) => (
          <TabsContent key={tab} value={tab} className="p-2 text-sm text-muted-foreground w-full">
            
            {/* -------- Home Tab -------- */}
            {tab === "Home" && (
              <div className="w-full max-w-full">
                <h2 className="text-lg font-semibold mb-1">Program Information</h2>
                <div className="border border-gray-300 rounded w-full p-3 flex flex-col text-sm">
                  <div className="grid grid-cols-2 gap-x-3 gap-y-1">
                    <div><span className="font-medium">Project Code: </span>PRJ-001</div>
                    <div><span className="font-medium">Focal Point: </span>John Doe</div>
                    <div><span className="font-medium">Province: </span>Kabul</div>
                    <div><span className="font-medium">District: </span>District 1</div>
                    <div><span className="font-medium">Village: </span>Village A</div>
                    <div><span className="font-medium">Specific Location: </span>Near River</div>
                    <div><span className="font-medium">Number of Groups: </span>5</div>
                  </div>
                  <div className="mt-1">
                    <span className="font-medium">Remark: </span>This is a remark for the project.
                  </div>
                </div>

                <h2 className="text-lg font-semibold mb-1 mt-3">Community Dialogue Session</h2>
                <div className="overflow-x-hidden">
                  <Table className="border border-gray-300 w-full table-fixed">
                    <TableHeader>
                      <TableRow className="bg-gray-100 text-xs">
                        <TableHead className="border-r border-gray-300 text-left px-2 py-1">Session</TableHead>
                        <TableHead className="border-r border-gray-300 text-left px-2 py-1">CD Topic</TableHead>
                        <TableHead className="text-left px-2 py-1">CD Date</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {sessionsData.map((s) => (
                        <TableRow key={s.session} className="text-xs">
                          <TableCell className="border-r border-gray-300 px-2 py-1">{s.session}</TableCell>
                          <TableCell className="border-r border-gray-300 px-2 py-1">{s.topic}</TableCell>
                          <TableCell className="px-2 py-1">{s.date}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>
            )}

            {/* -------- Group 1 Tab -------- */}
            {tab === "Group 1" && (
              <div className="w-full max-w-full">
                <div className="flex items-center justify-between mb-2">
                  <h2 className="text-lg font-semibold">List of Beneficiaries</h2>
                  
                  {/* Add New Button with Modal */}
                  <AddBeneInCDProfile title="Add New" />
                </div>

                <div className="overflow-x-hidden">
                  <Table className="border border-gray-300 w-full table-fixed">
                    <TableHeader>
                      <TableRow className="bg-gray-100 text-xs">
                        <TableHead className="border-r border-gray-300 text-left px-2 py-1">ID</TableHead>
                        <TableHead className="border-r border-gray-300 text-left px-2 py-1">Name</TableHead>
                        <TableHead className="border-r border-gray-300 text-left px-2 py-1">Age</TableHead>
                        <TableHead className="text-left px-2 py-1">Gender</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {beneficiariesData.map((b) => (
                        <TableRow key={b.id} className="text-xs">
                          <TableCell className="border-r border-gray-300 px-2 py-1">{b.id}</TableCell>
                          <TableCell className="border-r border-gray-300 px-2 py-1">{b.name}</TableCell>
                          <TableCell className="border-r border-gray-300 px-2 py-1">{b.age}</TableCell>
                          <TableCell className="px-2 py-1">{b.gender}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>
            )}

            {/* -------- Other Tabs -------- */}
            {tab !== "Home" && tab !== "Group 1" && <p>Content for {tab}</p>}
          </TabsContent>
        ))}
      </ShadcnTabs>
    </div>
  );
}
