"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useParentContext } from "@/contexts/ParentContext";
import { useEffect, useState } from "react";
import { useProjectEditContext } from "../edit_project/[id]/page";
import { useProjectShowContext } from "../project_show/[id]/page";
import { useProjectContext } from "../create_new_project/page";
import { Logs } from "@/types/Types";
import { AprLogsSubPageInterface } from "@/interfaces/Interfaces";
import { IsCreateMode, IsShowMode } from "@/constants/Constants";
import { Skeleton } from "@/components/ui/skeleton";

const AprLogsSubPage: React.FC<AprLogsSubPageInterface> = ({ mode }) => {
  const { requestHandler, reqForToastAndSetMessage } = useParentContext();
  const { projectId } = IsCreateMode(mode)
    ? useProjectContext()
    : IsShowMode(mode)
    ? useProjectShowContext()
    : useProjectEditContext();
  const [selectedComment, setSelectedComment] = useState<string>("");
  const [open, setOpen] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);

  const [logs, setLogs] = useState<Logs>([]);

  useEffect(() => {
    if (!projectId) return;
    setLoading(true);
    requestHandler()
      .get(`/projects/logs/${projectId}`)
      .then((response: any) => setLogs(response.data.data))
      .catch((error: any) =>
        reqForToastAndSetMessage(error.response.data.message, "error")
      )
      .finally(() => setLoading(false));
  }, []);

  return (
    <>
      <Card className="h-full">
        <CardHeader>
          <CardTitle>Apr Finalization</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-6 overflow-y-auto">
          <>
            <Table className="w-full">
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[150px]">Action</TableHead>
                  <TableHead className="w-[120px]">Doer</TableHead>
                  <TableHead className="w-[250px]">Comment</TableHead>
                  <TableHead className="w-[120px]">Date</TableHead>
                </TableRow>
              </TableHeader>
              {loading
                ? Array.from({ length: 10 }).map((_, rowIndex) => (
                    <TableRow key={rowIndex}>
                      {Array.from("something")
                        .slice(0, 8)
                        .map((col, colIndex) => (
                          <TableCell key={colIndex}>
                            <Skeleton className="h-4 w-full" />
                          </TableCell>
                        ))}
                    </TableRow>
                  ))
                : logs.length >= 1 && (
                    <TableBody>
                      {logs.map((item, index) => (
                        <TableRow key={index}>
                          <TableCell>{item.action}</TableCell>
                          <TableCell>{item.userName}</TableCell>
                          <TableCell>
                            <button
                              onClick={() => {
                                setSelectedComment(item.comment);
                                setOpen(true);
                              }}
                              className="block max-w-[220px] truncate text-left hover:underline"
                              title={"Click for check full comment"}
                            >
                              {item.comment}
                            </button>
                          </TableCell>
                          <TableCell>{item.date}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  )}
            </Table>

            {!loading && logs.length == 0 && (
              <div className="flex flex-row items-center justify-center min-h-[100px] text-gray-400">
                No Records
              </div>
            )}

            <Dialog open={open} onOpenChange={setOpen}>
              <DialogContent className="max-w-lg">
                <DialogHeader>
                  <DialogTitle>Comment</DialogTitle>
                </DialogHeader>
                <div className="mt-2 text-sm">
                  {selectedComment}
                </div>
                <div className="mt-4 flex justify-end">
                  <Button onClick={() => setOpen(false)}>Close</Button>
                </div>
              </DialogContent>
            </Dialog>
          </>
        </CardContent>
      </Card>
    </>
  );
};

export default AprLogsSubPage;
