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
import { Edit, Eye, Trash, Plus, Target } from "lucide-react";
import { Outcome } from "../types/Types";
import { useParentContext } from "@/contexts/ParentContext";
import { useProjectContext } from "../create_new_project/page";
import { useProjectEditContext } from "../edit_project/[id]/page";
import { useProjectShowContext } from "../project_show/[id]/page";
import { cardsBottomButtons } from "./CardsBottomButtons";
import { OutcomeFormInterface } from "@/interfaces/Interfaces";
import {
  IsCreateMode,
  IsNoOutcome,
  IsNotANullValue,
  IsNotShowMode,
  IsShowMode,
} from "@/constants/Constants";
import { DeleteOutcomeMessage } from "@/constants/ConfirmationModelsTexts";
import OutcomeModel from "@/components/global/OutcomeEditModel";
import OutcomeEditModal from "@/components/global/OutcomeEditModel";

const OutcomeForm: React.FC<OutcomeFormInterface> = ({ mode }) => {
  const { reqForConfirmationModelFunc } = useParentContext();

  const {
    outcomes,
    setOutcomes,
    setCurrentTab,
    handleDelete,
  }: {
    outcomes: Outcome[];
    setOutcomes: React.Dispatch<React.SetStateAction<Outcome[]>>;
    setCurrentTab: (value: string) => void;
    handleDelete: (url: string, id: string | null) => void;
  } = IsCreateMode(mode)
    ? useProjectContext()
    : IsShowMode(mode)
    ? useProjectShowContext()
    : useProjectEditContext();

  const [reqForOutcomeEditModel, setReqForOutcomeEditModel] =
    useState<boolean>(false);
  const [reqForOutcomeShowModel, setReqForOutcomeShowModel] =
    useState<boolean>(false);
  const [outcomeIdForEditOrShow, setOutcomeIdForEditOrShow] = useState<
    number | null
  >(null);
  const [reqForOutcomeForm, setReqForOutcomeForm] = useState<boolean>(false);

  const readOnly = IsShowMode(mode);
  const filteredOutcomes = outcomes.filter((outcome) => !IsNoOutcome(outcome));

  return (
    <>
      <Card className="h-full border border-border bg-card shadow-sm flex flex-col rounded-xl overflow-hidden min-h-[500px]">
        <CardHeader className="border-b pb-4 flex flex-row items-center justify-between gap-4">
          <div>
            <CardTitle className="text-xl font-bold tracking-tight text-foreground flex items-center gap-2">
              <Target className="text-primary" size={22} />
              Project Outcomes
            </CardTitle>
            <p className="text-sm text-muted-foreground mt-0.5">
              Manage and track structural objectives defined for this program.
            </p>
          </div>
          {IsNotShowMode(mode) && (
            <Button
              onClick={() => setReqForOutcomeForm(!reqForOutcomeForm)}
              className="gap-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/95 shadow-sm"
            >
              <Plus size={16} /> Add Outcome
            </Button>
          )}
        </CardHeader>

        <CardContent className="p-6 overflow-y-auto flex-1 no-scrollbar">
          <div className="mt-2">
            {filteredOutcomes.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-muted-foreground gap-1.5 border border-dashed rounded-xl bg-muted/10">
                <span className="text-base font-medium">
                  No Outcomes Specified
                </span>
                <p className="text-sm text-muted-foreground/70">
                  Click the button above to register a operational goal
                  parameter.
                </p>
              </div>
            ) : (
              <div className="border border-border rounded-xl divide-y divide-border bg-background shadow-inner overflow-hidden">
                {filteredOutcomes.map((item) => (
                  <div
                    key={item.id || item.outcomeRef}
                    className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-4 hover:bg-muted/30 transition-colors"
                  >
                    <div
                      className="flex flex-col min-w-0 flex-1 cursor-pointer"
                      title={`Outcome: ${item.outcome} \nOutcome Reference: ${item.outcomeRef}`}
                    >
                      <span className="font-semibold text-foreground text-base truncate">
                        {item.outcome}
                      </span>
                      <span className="text-xs font-mono tracking-wider text-muted-foreground uppercase mt-0.5">
                        Ref: {item.outcomeRef}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 sm:justify-end shrink-0">
                      {/* دکمه حذف - اصلاح باگ مقایسه آی‌دی به جای ایندکس خطی */}
                      {!readOnly && (
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() =>
                            reqForConfirmationModelFunc(
                              DeleteOutcomeMessage,
                              () => {
                                setOutcomes((prev) =>
                                  prev.filter((o) => o.id !== item.id)
                                );
                                handleDelete(`projects/outcome`, item.id);
                              }
                            )
                          }
                          className="h-9 w-9 rounded-lg text-destructive hover:bg-destructive/10 hover:text-destructive transition-colors"
                        >
                          <Trash size={16} />
                        </Button>
                      )}

                      {/* دکمه‌های نمایش و ویرایش */}
                      {IsNotANullValue(item.id) && (
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => {
                            setOutcomeIdForEditOrShow(
                              item.id as unknown as number
                            );
                            if (!readOnly) setReqForOutcomeEditModel(true);
                            else setReqForOutcomeShowModel(true);
                          }}
                          className="h-9 w-9 rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
                        >
                          {readOnly ? <Eye size={16} /> : <Edit size={16} />}
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </CardContent>

        {/* دکمه‌های ناوبری پایدار و هماهنگ */}
        <CardFooter className="p-6 border-t bg-muted/20 flex justify-end">
          {cardsBottomButtons(
            setCurrentTab,
            "project",
            undefined,
            false,
            setCurrentTab,
            "output"
          )}
        </CardFooter>
      </Card>

      {/* مدال‌های داینامیک ثبت، ویرایش و نمایش */}
      {IsNotShowMode(mode) && reqForOutcomeForm && (
        <OutcomeModel
          isOpen={reqForOutcomeForm}
          onOpenChange={setReqForOutcomeForm}
          mode="create"
          pageIdentifier={mode}
        />
      )}

      {(reqForOutcomeEditModel || reqForOutcomeShowModel) &&
        outcomeIdForEditOrShow && (
          <OutcomeEditModal
            isOpen={readOnly ? reqForOutcomeShowModel : reqForOutcomeEditModel}
            onOpenChange={
              readOnly ? setReqForOutcomeShowModel : setReqForOutcomeEditModel
            }
            outcomeId={outcomeIdForEditOrShow}
            mode={readOnly ? "show" : "edit"}
            pageIdentifier={mode}
          />
        )}
    </>
  );
};

export default OutcomeForm;
