"use client";

import React, { useState } from "react";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Edit, Eye, Trash, Plus, Layers, FolderSync } from "lucide-react";
import { Outcome, Output } from "../types/Types";
import { useParentContext } from "@/contexts/ParentContext";
import { useProjectContext } from "../create_new_project/page";
import { useProjectEditContext } from "../edit_project/[id]/page";
import { useProjectShowContext } from "../project_show/[id]/page";
import { cardsBottomButtons } from "./CardsBottomButtons";
import { OutputFormInterface } from "@/interfaces/Interfaces";
import {
  IsCreateMode,
  IsNoOutcome,
  IsNotShowMode,
  IsOutcomeSaved,
  IsOutputRelatedToThisOutcome,
  IsShowMode,
} from "@/constants/Constants";
import { DeleteOutputMessage } from "@/constants/ConfirmationModelsTexts";
import OutputModel from "@/components/global/OutputEditModel";
import OutputEditModel from "@/components/global/OutputEditModel";

const OutputForm: React.FC<OutputFormInterface> = ({ mode }) => {
  const { reqForConfirmationModelFunc } = useParentContext();

  const {
    setCurrentTab,
    outcomes,
    outputs,
    setOutputs,
    handleDelete,
  }: {
    setCurrentTab: (value: string) => void;
    outcomes: Outcome[];
    outputs: Output[];
    setOutputs: React.Dispatch<React.SetStateAction<Output[]>>;
    handleDelete: (url: string, id: string | null) => void;
  } = IsCreateMode(mode)
    ? useProjectContext()
    : IsShowMode(mode)
    ? useProjectShowContext()
    : useProjectEditContext();

  const [reqForOutputEditModel, setReqForOutputEditModel] =
    useState<boolean>(false);
  const [reqForOutputShowModel, setReqForOutputShowModel] =
    useState<boolean>(false);
  const [outputIdForEditOrShow, setOutputIdForEditOrShow] = useState<
    number | null
  >(null);
  const [reqForOutputForm, setReqForOutputForm] = useState(false);

  const readOnly = IsShowMode(mode);
  const savedOutcomes = outcomes.filter((o) => IsOutcomeSaved(o));

  return (
    <>
      <Card className="h-full border border-border bg-card shadow-sm flex flex-col rounded-xl overflow-hidden min-h-[500px]">
        <CardHeader className="border-b pb-4 flex flex-row items-center justify-between gap-4">
          <div>
            <CardTitle className="text-xl font-bold tracking-tight text-foreground flex items-center gap-2">
              <Layers className="text-primary" size={22} />
              Project Outputs
            </CardTitle>
            <p className="text-sm text-muted-foreground mt-0.5">
              Map individual system targets directly underneath logical targets.
            </p>
          </div>
          {IsNotShowMode(mode) && (
            <Button
              onClick={() => setReqForOutputForm(!reqForOutputForm)}
              className="gap-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/95 shadow-sm"
            >
              <Plus size={16} /> Add Output
            </Button>
          )}
        </CardHeader>

        <CardContent className="p-6 overflow-y-auto flex-1 no-scrollbar">
          {savedOutcomes.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-muted-foreground gap-1.5 border border-dashed rounded-xl bg-muted/10">
              <FolderSync size={32} className="text-muted-foreground/60" />
              <span className="text-base font-medium">
                No Parent Outcomes Found
              </span>
              <p className="text-sm text-muted-foreground/70">
                You must finalize your project outcomes before appending child
                outputs.
              </p>
            </div>
          ) : (
            <Accordion type="single" collapsible className="w-full space-y-3">
              {savedOutcomes.map((outcomeItem, index) => {
                const conceptualOutputs = outputs.filter((o) =>
                  IsOutputRelatedToThisOutcome(
                    Number(outcomeItem.id),
                    Number(o.outcomeId)
                  )
                );

                return (
                  <AccordionItem
                    key={outcomeItem.id || index}
                    value={`item-${index}`}
                    className="border border-border rounded-xl px-4 bg-muted/5 shadow-sm overflow-hidden"
                  >
                    <AccordionTrigger
                      className="text-left font-bold text-base hover:no-underline py-4 text-foreground data-[state=open]:text-primary transition-colors"
                      title={`Outcome: ${outcomeItem.outcome}`}
                    >
                      <span>
                        {IsNoOutcome(outcomeItem)
                          ? "No Appended Outcome"
                          : outcomeItem.outcomeRef}
                      </span>
                    </AccordionTrigger>

                    <AccordionContent className="pt-2 pb-4 space-y-3">
                      {conceptualOutputs.length === 0 ? (
                        <p className="text-center text-sm text-muted-foreground/70 py-4 italic bg-background rounded-lg border border-dashed">
                          No outputs linked to this outcome parameter yet.
                        </p>
                      ) : (
                        <div className="border border-border rounded-lg divide-y divide-border bg-background overflow-hidden">
                          {conceptualOutputs.map((outputItem) => (
                            <div
                              key={outputItem.id}
                              className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-4 hover:bg-muted/30 transition-colors"
                            >
                              <div className="flex flex-col gap-0.5 min-w-0 flex-1">
                                <span className="font-semibold text-foreground text-sm truncate max-w-[200px]">
                                  {outputItem.output}
                                </span>
                                <span className="text-xs font-mono tracking-wider text-muted-foreground uppercase">
                                  Ref: {outputItem.outputRef}
                                </span>
                              </div>

                              <div className="flex items-center gap-2 sm:justify-end shrink-0">
                                {!readOnly && (
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() =>
                                      reqForConfirmationModelFunc(
                                        DeleteOutputMessage,
                                        () => {
                                          setOutputs((prev) =>
                                            prev.filter(
                                              (o) => o.id !== outputItem.id
                                            )
                                          );
                                          handleDelete(
                                            `projects/output`,
                                            outputItem.id
                                          );
                                        }
                                      )
                                    }
                                    className="h-8 w-8 rounded-md text-destructive hover:bg-destructive/10 hover:text-destructive transition-colors"
                                  >
                                    <Trash size={15} />
                                  </Button>
                                )}

                                {outputItem.id && (
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => {
                                      setOutputIdForEditOrShow(
                                        outputItem.id as unknown as number
                                      );
                                      if (!readOnly)
                                        setReqForOutputEditModel(true);
                                      else setReqForOutputShowModel(true);
                                    }}
                                    className="h-8 w-8 rounded-md text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
                                  >
                                    {readOnly ? (
                                      <Eye size={15} />
                                    ) : (
                                      <Edit size={15} />
                                    )}
                                  </Button>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </AccordionContent>
                  </AccordionItem>
                );
              })}
            </Accordion>
          )}
        </CardContent>

        <CardFooter className="p-6 border-t bg-muted/20 flex justify-end">
          {cardsBottomButtons(
            setCurrentTab,
            "outcome",
            undefined,
            false,
            setCurrentTab,
            "indicator"
          )}
        </CardFooter>
      </Card>

      {IsNotShowMode(mode) && reqForOutputForm && (
        <OutputModel
          isOpen={reqForOutputForm}
          onOpenChange={setReqForOutputForm}
          mode="create"
          pageIdentifier={mode}
        />
      )}

      {(reqForOutputEditModel || reqForOutputShowModel) &&
        outputIdForEditOrShow && (
          <OutputEditModel
            isOpen={readOnly ? reqForOutputShowModel : reqForOutputEditModel}
            onOpenChange={
              readOnly
                ? () => setReqForOutputShowModel(false)
                : () => setReqForOutputEditModel(false)
            }
            mode={readOnly ? "show" : "edit"}
            pageIdentifier={mode}
            outputId={outputIdForEditOrShow}
          />
        )}
    </>
  );
};

export default OutputForm;
