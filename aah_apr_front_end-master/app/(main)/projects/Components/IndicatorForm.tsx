"use client";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Edit, Eye, Trash, Plus, BarChart3 } from "lucide-react";
import {
  Dessaggregation,
  Indicator,
  Outcome,
  Output,
  Project,
} from "../types/Types";
import React, { useState } from "react";
import { useParentContext } from "@/contexts/ParentContext";
import IndicatorModel from "@/components/global/IndicatorEditModel";
import { useProjectEditContext } from "../edit_project/[id]/page";
import { useProjectShowContext } from "../project_show/[id]/page";
import { useProjectContext } from "../create_new_project/page";
import { cardsBottomButtons } from "./CardsBottomButtons";
import { IndicatorFormInterface } from "@/interfaces/Interfaces";
import {
  IsCreateMode,
  IsIndicatorRelatedToThisOutput,
  IsNotShowMode,
  IsNotSubIndicator,
  IsOutputSaved,
  IsShowMode,
} from "@/constants/Constants";
import { DeleteIndicatorMessage } from "@/constants/ConfirmationModelsTexts";
import { Button } from "@/components/ui/button";

const IndicatorForm: React.FC<IndicatorFormInterface> = ({ mode }) => {
  const { reqForConfirmationModelFunc } = useParentContext();

  const {
    outputs,
    indicators,
    setIndicators,
    setCurrentTab,
    handleDelete,
    setDessaggregations,
  }: {
    outcomes: Outcome[];
    outputs: Output[];
    indicators: Indicator[];
    setIndicators: React.Dispatch<React.SetStateAction<Indicator[]>>;
    setDessaggregations: React.Dispatch<
      React.SetStateAction<Dessaggregation[]>
    >;
    formData: Project;
    setCurrentTab: React.Dispatch<React.SetStateAction<string>>;
    handleDelete: (url: string, id: string | null) => void;
  } = IsCreateMode(mode)
    ? useProjectContext()
    : IsShowMode(mode)
    ? useProjectShowContext()
    : useProjectEditContext();

  const [indicatorIdForEditOrShow, setIndicatorIdForEditOrShow] = useState<
    number | null
  >(null);
  const [reqForIndicatorEditModel, setReqForIndicatorEditModel] =
    useState<boolean>(false);
  const [reqForIndicatorShowModel, setReqForIndicatorShowModel] =
    useState<boolean>(false);
  const [reqForIndicatorForm, setReqForIndicatorForm] = useState(false);

  const readOnly = IsShowMode(mode);
  const savedOutputs = outputs.filter((o) => IsOutputSaved(o));

  return (
    <>
      <Card className="h-full border border-border bg-card shadow-sm flex flex-col rounded-xl overflow-hidden min-h-[500px]">
        <CardHeader className="border-b pb-4 flex flex-row items-center justify-between gap-4">
          <div>
            <CardTitle className="text-xl font-bold tracking-tight text-foreground flex items-center gap-2">
              <BarChart3 className="text-primary" size={22} />
              Project Indicators
            </CardTitle>
            <p className="text-sm text-muted-foreground mt-0.5">
              Define quantitative measurement parameters linked to program
              outputs.
            </p>
          </div>
          {IsNotShowMode(mode) && (
            <Button
              onClick={() => setReqForIndicatorForm(!reqForIndicatorForm)}
              className="gap-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/95 shadow-sm"
            >
              <Plus size={16} /> Add Indicator
            </Button>
          )}
        </CardHeader>

        <CardContent className=" p-6 overflow-y-auto flex-1 no-scrollbar">
          {savedOutputs.length >= 1 ? (
            <Accordion type="single" collapsible className="w-full space-y-3">
              {savedOutputs.map((item, index) => (
                <AccordionItem
                  key={item.id || index}
                  value={`item-${index}`}
                  className="border border-border rounded-xl px-4 bg-muted/5 shadow-sm overflow-hidden"
                >
                  <AccordionTrigger
                    title={`Output: ${item.output} \nOutput Reference: ${item.outputRef}`}
                    className="text-left font-bold text-base hover:no-underline py-4 text-foreground data-[state=open]:text-primary transition-colors"
                  >
                    <span>{item.outputRef}</span>
                  </AccordionTrigger>

                  <AccordionContent className="pt-2 pb-4 space-y-3">
                    <div className="border border-border rounded-lg divide-y divide-border bg-background overflow-hidden">
                      {indicators
                        .filter((ind) =>
                          IsIndicatorRelatedToThisOutput(
                            Number(item.id),
                            Number(ind.outputId)
                          )
                        )
                        .filter((ind) => IsNotSubIndicator(ind))
                        .map((indItem) => (
                          <div
                            key={indItem.id || indItem.indicatorRef}
                            className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-4 hover:bg-muted/30 transition-colors"
                          >
                            <div className="flex flex-col gap-0.5 min-w-0 flex-1">
                              <span
                                className="font-semibold text-foreground text-sm truncate max-w-[200px]"
                                title={indItem.indicator}
                              >
                                {indItem.indicator}
                              </span>
                              <span className="text-xs font-mono tracking-wider text-muted-foreground uppercase">
                                Ref: {indItem.indicatorRef}
                              </span>
                            </div>

                            <div className="flex items-center gap-2 sm:justify-end shrink-0">
                              {!readOnly && (
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() =>
                                    reqForConfirmationModelFunc(
                                      DeleteIndicatorMessage,
                                      () => {
                                        setIndicators((prev) =>
                                          prev.filter(
                                            (i) => i.id !== indItem.id
                                          )
                                        );
                                        setDessaggregations((prev) =>
                                          prev.filter(
                                            (d) => d.indicatorId !== indItem.id
                                          )
                                        );
                                        handleDelete(
                                          "projects/indicator",
                                          indItem.id
                                        );
                                      }
                                    )
                                  }
                                  className="h-8 w-8 rounded-md text-destructive hover:bg-destructive/10 hover:text-destructive transition-colors"
                                >
                                  <Trash size={15} />
                                </Button>
                              )}

                              {indItem.id && (
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => {
                                    setIndicatorIdForEditOrShow(
                                      Number(indItem.id)
                                    );
                                    if (!readOnly)
                                      setReqForIndicatorEditModel(true);
                                    else setReqForIndicatorShowModel(true);
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
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          ) : (
            <div className="flex flex-col items-center justify-center py-16 text-muted-foreground gap-1.5 border border-dashed rounded-xl bg-muted/10">
              <span className="text-base font-medium">
                No Indicators Appended Yet
              </span>
              <p className="text-sm text-muted-foreground/70">
                Ensure parent output scopes are configured before linking
                quantitative metrics.
              </p>
            </div>
          )}
        </CardContent>

        <CardFooter className="p-6 border-t bg-muted/20 flex justify-end">
          {cardsBottomButtons(
            setCurrentTab,
            "output",
            undefined,
            false,
            setCurrentTab,
            "dessaggregation"
          )}
        </CardFooter>
      </Card>

      {IsNotShowMode(mode) && reqForIndicatorForm && (
        <IndicatorModel
          isOpen={reqForIndicatorForm}
          onClose={() => setReqForIndicatorForm(false)}
          mode="create"
          pageIdentifier={mode}
        />
      )}

      {(reqForIndicatorEditModel || reqForIndicatorShowModel) &&
        indicatorIdForEditOrShow && (
          <IndicatorModel
            isOpen={
              readOnly ? reqForIndicatorShowModel : reqForIndicatorEditModel
            }
            onClose={
              readOnly
                ? () => setReqForIndicatorShowModel(false)
                : () => setReqForIndicatorEditModel(false)
            }
            indicatorId={indicatorIdForEditOrShow}
            mode={readOnly ? "show" : "edit"}
            pageIdentifier={mode}
          />
        )}
    </>
  );
};

export default IndicatorForm;
