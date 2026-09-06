"use client";

import * as React from "react";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { AxiosError, AxiosResponse } from "axios";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Skeleton } from "../ui/skeleton";

import { useParentContext } from "@/contexts/ParentContext";
import { MealToolDefault } from "@/constants/FormsDefaultValues";
import { MealToolFormType } from "@/types/Types";

import {
  MealToolCreationMessage,
  MealToolEditionMessage,
} from "@/constants/ConfirmationModelsTexts";

import {
  baselineOptions,
  endlineOptions,
} from "@/constants/SingleAndMultiSelectOptionsList";

import { MealToolInterface } from "@/interfaces/Interfaces";
import { IsCreateMode, IsEditMode, IsShowMode } from "@/constants/Constants";

import { SUBMIT_BUTTON_PROVIDER_ID } from "@/config/System";
import StringHelper from "@/helpers/StringHelpers/StringHelper";
import { MealToolFormSchema } from "@/schemas/FormsSchema";

import {
  ClipboardList,
  Info,
  Loader2,
  CalendarDays,
  BarChart3,
  Scale,
} from "lucide-react";

import { cn } from "@/lib/utils";

const MealToolForm: React.FC<MealToolInterface> = ({
  open,
  onOpenChange,
  mealToolsStateSetter,
  mode,
  mealtoolId,
}) => {
  const {
    requestHandler,
    reqForConfirmationModelFunc,
    reqForToastAndSetMessage,
  } = useParentContext();

  const { id } = useParams();

  const [loading, setLoading] = useState(false);

  const [baselineSelection, setBaselineSelection] = useState<string>("");

  const [endlineSelection, setEndlineSelection] = useState<string>("");

  const [mealTool, setMealTool] = useState<MealToolFormType>(
    MealToolDefault(id as unknown as string)
  );

  const [formErrors, setFormErrors] = useState<{
    [key: string]: string;
  }>({});

  /**
   * ---------------------------------------------------------
   * Form Change
   * ---------------------------------------------------------
   */
  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    setMealTool((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (formErrors[name]) {
      setFormErrors((prev) => {
        const next = { ...prev };
        delete next[name];
        return next;
      });
    }
  };

  /**
   * ---------------------------------------------------------
   * Active Checkbox Change
   * ---------------------------------------------------------
   */
  const handleActiveCheckboxChange = (
    field: "isBaselineActive" | "isEndlineActive",
    value: boolean
  ) => {
    setMealTool((prev) => ({
      ...prev,
      [field]: value,
    }));

    if (formErrors[field]) {
      setFormErrors((prev) => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
  };

  /**
   * ---------------------------------------------------------
   * Assessment Configuration Change
   * ---------------------------------------------------------
   */
  const handleAssessmentSelectionChange = (
    field: "baseline" | "endline",
    value: string
  ) => {
    if (field === "baseline") {
      setBaselineSelection(value);
    } else {
      setEndlineSelection(value);
    }

    if (formErrors[field]) {
      setFormErrors((prev) => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
  };

  /**
   * ---------------------------------------------------------
   * Submit
   * ---------------------------------------------------------
   */
  const handleSubmitMealtoolForm = (
    submittedMealTool: MealToolFormType & {
      baseline: string;
      endline: string;
    }
  ) => {
    const result = MealToolFormSchema.safeParse(submittedMealTool);

    if (!result.success) {
      const errors: { [key: string]: string } = {};

      result.error.issues.forEach((issue) => {
        const field = issue.path[0];

        if (field) {
          errors[String(field)] = issue.message;
        }
      });

      setFormErrors(errors);

      reqForToastAndSetMessage(
        "Please resolve the validation errors before submitting.",
        "warning"
      );

      return;
    }

    setFormErrors({});
    setLoading(true);

    /**
     * -------------------------------------------------------
     * Create
     * -------------------------------------------------------
     */
    if (IsCreateMode(mode)) {
      requestHandler()
        .post(`/main_db/beneficiary/mealtools/${id}`, submittedMealTool)
        .then((response: any) => {
          reqForToastAndSetMessage(response.data.message, "success");

          mealToolsStateSetter((prev: any) => [
            ...prev,
            {
              id: response.data.data.id,
              ...submittedMealTool,
            },
          ]);

          setMealTool(MealToolDefault(id as unknown as string));

          setBaselineSelection("");
          setEndlineSelection("");
          setFormErrors({});

          onOpenChange(false);
        })
        .catch((error: any) => {
          reqForToastAndSetMessage(
            error.response?.data?.message || "An error occurred.",
            "error"
          );
        })
        .finally(() => setLoading(false));

      return;
    }

    /**
     * -------------------------------------------------------
     * Edit
     * -------------------------------------------------------
     */
    if (IsEditMode(mode)) {
      requestHandler()
        .put(
          `/main_db/beneficiary/mealtool/${submittedMealTool.id}`,
          submittedMealTool
        )
        .then((response: any) => {
          reqForToastAndSetMessage(response.data.message, "success");

          mealToolsStateSetter((prev: any) =>
            prev.map((mt: any) =>
              mt.id == mealtoolId
                ? {
                    ...submittedMealTool,
                    baseline: baselineSelection,
                    endline: endlineSelection,
                  }
                : mt
            )
          );

          onOpenChange(false);
        })
        .catch((error: any) => {
          reqForToastAndSetMessage(
            error.response?.data?.message || "An error occurred.",
            "error"
          );
        })
        .finally(() => setLoading(false));
    }
  };

  /**
   * ---------------------------------------------------------
   * Load Meal Tool
   * ---------------------------------------------------------
   */
  useEffect(() => {
    if (!open) return;

    if ((IsShowMode(mode) || IsEditMode(mode)) && mealtoolId) {
      setLoading(true);

      requestHandler()
        .get(`main_db/beneficiary/mealtool/${mealtoolId}`)
        .then((response: AxiosResponse<any>) => {
          const data = response.data.data;

          setMealTool(data);

          setBaselineSelection(data.baseline);

          setEndlineSelection(data.endline);

          setFormErrors({});
        })
        .catch((error: AxiosError<any>) => {
          reqForToastAndSetMessage(
            error.response?.data?.message || "Unable to load meal tool.",
            "error"
          );
        })
        .finally(() => setLoading(false));
    }
  }, [open, mode, mealtoolId]);

  /**
   * ---------------------------------------------------------
   * Field Error
   * ---------------------------------------------------------
   */
  const FieldError = ({ field }: { field: string }) => {
    if (!formErrors[field]) return null;

    return (
      <span className="text-[10px] font-medium text-destructive flex items-center gap-1 mt-0.5 animate-in fade-in">
        <Info className="h-3 w-3 shrink-0" />
        {formErrors[field]}
      </span>
    );
  };

  /**
   * ---------------------------------------------------------
   * Input Class
   * ---------------------------------------------------------
   */
  const inputClass = (field: string) =>
    cn(
      "bg-background border-input text-foreground",
      "focus-visible:ring-ring h-10 rounded-md text-xs",
      "transition-colors",
      formErrors[field] && "border-destructive focus-visible:ring-destructive"
    );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="
          min-w-4xl
          w-[92vw]
          max-h-[85vh]
          flex
          flex-col
          p-6
          bg-card
          border
          border-border
          text-card-foreground
          shadow-2xl
          rounded-lg
          overflow-hidden
          animate-in
          fade-in
          zoom-in-95
          duration-200
        "
      >
        {/* =====================================================
            Header
        ====================================================== */}
        <DialogHeader className="border-b border-border pb-3">
          <DialogTitle className="text-base font-bold text-foreground flex items-center gap-2">
            <ClipboardList className="h-5 w-5 text-primary" />

            {IsCreateMode(mode)
              ? "Add Meal Tool"
              : IsEditMode(mode)
              ? "Edit Meal Tool"
              : "Meal Tool Details"}
          </DialogTitle>
        </DialogHeader>

        {/* =====================================================
            Scrollable Body
        ====================================================== */}
        <div className="flex-1 overflow-y-auto pr-1 space-y-6 py-4 scrollbar-thin scrollbar-thumb-border">
          {loading ? (
            <>
              <div className="rounded-lg border border-border/80 p-4 bg-muted/20 space-y-4">
                <Skeleton className="h-4 w-40" />

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {Array.from({ length: 4 }).map((_, index) => (
                    <div key={index} className="flex flex-col gap-1.5">
                      <Skeleton className="h-3 w-24" />
                      <Skeleton className="h-10 w-full rounded-md" />
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-4">
                <Skeleton className="h-4 w-32" />

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {Array.from({ length: 3 }).map((_, index) => (
                    <div key={index} className="flex flex-col gap-1.5">
                      <Skeleton className="h-3 w-28" />
                      <Skeleton className="h-10 w-full rounded-md" />
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-4">
                <Skeleton className="h-4 w-40" />
                <Skeleton className="h-10 w-full rounded-md" />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Skeleton className="h-28 w-full rounded-lg" />
                <Skeleton className="h-28 w-full rounded-lg" />
              </div>
            </>
          ) : (
            <>
              {/* =================================================
                  Section 1: Basic Information
              ================================================== */}
              <div className="rounded-lg border border-border/80 p-4 bg-muted/20 space-y-4">
                <div className="text-xs font-bold uppercase tracking-wider text-primary flex items-center gap-2">
                  <CalendarDays className="h-4 w-4" />
                  Basic Information
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-4 gap-y-3.5">
                  {/* Type */}
                  <div className="flex flex-col gap-1.5">
                    <Label
                      htmlFor="type"
                      className="text-xs font-semibold text-muted-foreground"
                    >
                      Type
                    </Label>

                    <Input
                      id="type"
                      name="type"
                      value={mealTool.type ?? ""}
                      onChange={handleFormChange}
                      disabled={IsShowMode(mode)}
                      placeholder="Meal tool type..."
                      className={inputClass("type")}
                    />

                    <FieldError field="type" />
                  </div>

                  {/* Baseline Date */}
                  <div className="flex flex-col gap-1.5">
                    <Label
                      htmlFor="baselineDate"
                      className="text-xs font-semibold text-muted-foreground"
                    >
                      Date Of Baseline
                    </Label>

                    <Input
                      id="baselineDate"
                      name="baselineDate"
                      type="date"
                      value={mealTool.baselineDate ?? ""}
                      onChange={handleFormChange}
                      disabled={IsShowMode(mode)}
                      className={inputClass("baselineDate")}
                    />

                    <FieldError field="baselineDate" />
                  </div>

                  {/* Endline Date */}
                  <div className="flex flex-col gap-1.5">
                    <Label
                      htmlFor="endlineDate"
                      className="text-xs font-semibold text-muted-foreground"
                    >
                      Date Of Endline
                    </Label>

                    <Input
                      id="endlineDate"
                      name="endlineDate"
                      type="date"
                      value={mealTool.endlineDate ?? ""}
                      onChange={handleFormChange}
                      disabled={IsShowMode(mode)}
                      className={inputClass("endlineDate")}
                    />

                    <FieldError field="endlineDate" />
                  </div>

                  {/* Activation */}
                  <div className="flex flex-col gap-3 justify-center">
                    <div className="text-xs font-semibold text-muted-foreground">
                      Activation
                    </div>

                    <div className="flex flex-col gap-2">
                      {/* Baseline Active */}
                      <div className="flex items-center gap-2">
                        <Checkbox
                          id="isBaselineActive"
                          checked={mealTool.isBaselineActive ?? false}
                          disabled={IsShowMode(mode)}
                          onCheckedChange={(checked) =>
                            handleActiveCheckboxChange(
                              "isBaselineActive",
                              checked === true
                            )
                          }
                        />

                        <Label
                          htmlFor="isBaselineActive"
                          className="text-xs font-medium cursor-pointer"
                        >
                          Activate Baseline
                        </Label>
                      </div>

                      {/* Endline Active */}
                      <div className="flex items-center gap-2">
                        <Checkbox
                          id="isEndlineActive"
                          checked={mealTool.isEndlineActive ?? false}
                          disabled={IsShowMode(mode)}
                          onCheckedChange={(checked) =>
                            handleActiveCheckboxChange(
                              "isEndlineActive",
                              checked === true
                            )
                          }
                        />

                        <Label
                          htmlFor="isEndlineActive"
                          className="text-xs font-medium cursor-pointer"
                        >
                          Activate Endline
                        </Label>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* =================================================
                  Section 2: Scores
              ================================================== */}
              <div className="space-y-4">
                <div className="text-xs font-bold uppercase tracking-wider text-primary flex items-center gap-2 border-b border-border/60 pb-2">
                  <BarChart3 className="h-4 w-4" />
                  Score Information
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-4 gap-y-3.5">
                  {/* Baseline Total Score */}
                  <div className="flex flex-col gap-1.5">
                    <Label
                      htmlFor="baselineTotalScore"
                      className="text-xs font-semibold text-muted-foreground"
                    >
                      Baseline Total Score
                    </Label>

                    <Input
                      id="baselineTotalScore"
                      name="baselineTotalScore"
                      type="number"
                      value={mealTool.baselineTotalScore ?? ""}
                      onChange={handleFormChange}
                      disabled={IsShowMode(mode)}
                      placeholder="Baseline total score..."
                      className={inputClass("baselineTotalScore")}
                    />

                    <FieldError field="baselineTotalScore" />
                  </div>

                  {/* Endline Total Score */}
                  <div className="flex flex-col gap-1.5">
                    <Label
                      htmlFor="endlineTotalScore"
                      className="text-xs font-semibold text-muted-foreground"
                    >
                      Endline Total Score
                    </Label>

                    <Input
                      id="endlineTotalScore"
                      name="endlineTotalScore"
                      type="number"
                      value={mealTool.endlineTotalScore ?? ""}
                      onChange={handleFormChange}
                      disabled={IsShowMode(mode)}
                      placeholder="Endline total score..."
                      className={inputClass("endlineTotalScore")}
                    />

                    <FieldError field="endlineTotalScore" />
                  </div>

                  {/* Improvement Percentage */}
                  <div className="flex flex-col gap-1.5">
                    <Label
                      htmlFor="improvementPercentage"
                      className="text-xs font-semibold text-muted-foreground"
                    >
                      Percentage Of Improvement
                    </Label>

                    <Input
                      id="improvementPercentage"
                      name="improvementPercentage"
                      type="number"
                      value={mealTool.improvementPercentage ?? ""}
                      onChange={handleFormChange}
                      disabled={IsShowMode(mode)}
                      placeholder="Improvement percentage..."
                      className={inputClass("improvementPercentage")}
                    />

                    <FieldError field="improvementPercentage" />
                  </div>
                </div>
              </div>

              {/* =================================================
                  Section 3: Evaluation
              ================================================== */}
              <div className="space-y-4">
                <div className="text-xs font-bold uppercase tracking-wider text-primary flex items-center gap-2 border-b border-border/60 pb-2">
                  <Scale className="h-4 w-4" />
                  Evaluation
                </div>

                <div className="flex flex-col gap-1.5">
                  <Label
                    htmlFor="evaluation"
                    className="text-xs font-semibold text-muted-foreground"
                  >
                    Evaluation Based On General Judgment
                  </Label>

                  <Input
                    id="evaluation"
                    name="evaluation"
                    value={mealTool.evaluation ?? ""}
                    onChange={handleFormChange}
                    disabled={IsShowMode(mode)}
                    placeholder="Enter evaluation..."
                    className={inputClass("evaluation")}
                  />

                  <FieldError field="evaluation" />
                </div>
              </div>

              {/* =================================================
                  Section 4: Assessment Configuration
              ================================================== */}
              <div className="space-y-4">
                <div className="text-xs font-bold uppercase tracking-wider text-primary flex items-center gap-2 border-b border-border/60 pb-2">
                  <ClipboardList className="h-4 w-4" />
                  Assessment Configuration
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Baseline */}
                  <div
                    className={cn(
                      "rounded-lg border border-border/80",
                      "p-4 bg-muted/20 space-y-3",
                      formErrors.baseline && "border-destructive/70"
                    )}
                  >
                    <div className="text-xs font-bold uppercase tracking-wider text-foreground">
                      Baseline
                    </div>

                    <div className="flex flex-wrap gap-x-5 gap-y-3">
                      {baselineOptions.map((option) => (
                        <div key={option} className="flex items-center gap-2">
                          <Checkbox
                            checked={
                              baselineSelection.toLowerCase() ===
                              option.toLowerCase()
                            }
                            disabled={IsShowMode(mode)}
                            onCheckedChange={() =>
                              handleAssessmentSelectionChange(
                                "baseline",
                                option
                              )
                            }
                            className={cn(
                              formErrors.baseline && "border-destructive"
                            )}
                          />

                          <Label className="text-xs font-medium cursor-pointer">
                            {StringHelper.normalize(option)}
                          </Label>
                        </div>
                      ))}
                    </div>

                    <FieldError field="baseline" />
                  </div>

                  {/* Endline */}
                  <div
                    className={cn(
                      "rounded-lg border border-border/80",
                      "p-4 bg-muted/20 space-y-3",
                      formErrors.endline && "border-destructive/70"
                    )}
                  >
                    <div className="text-xs font-bold uppercase tracking-wider text-foreground">
                      Endline
                    </div>

                    <div className="flex flex-wrap gap-x-5 gap-y-3">
                      {endlineOptions.map((option) => (
                        <div key={option} className="flex items-center gap-2">
                          <Checkbox
                            checked={
                              endlineSelection.toLowerCase() ===
                              option.toLowerCase()
                            }
                            disabled={IsShowMode(mode)}
                            onCheckedChange={() =>
                              handleAssessmentSelectionChange("endline", option)
                            }
                            className={cn(
                              formErrors.endline && "border-destructive"
                            )}
                          />

                          <Label className="text-xs font-medium cursor-pointer">
                            {StringHelper.normalize(option)}
                          </Label>
                        </div>
                      ))}
                    </div>

                    <FieldError field="endline" />
                  </div>
                </div>
              </div>
            </>
          )}
        </div>

        {/* =====================================================
            Footer
        ====================================================== */}
        {!IsShowMode(mode) && (
          <div className="flex justify-end gap-3 pt-4 border-t border-border mt-auto">
            <Button
              variant="outline"
              type="button"
              disabled={loading}
              onClick={() => onOpenChange(false)}
              className="
                bg-secondary
                text-secondary-foreground
                hover:bg-secondary/80
                rounded-md
                h-10
                text-xs
                font-medium
              "
            >
              Cancel
            </Button>

            <Button
              id={SUBMIT_BUTTON_PROVIDER_ID}
              disabled={loading}
              type="button"
              onClick={() => {
                const submittedMealTool = {
                  ...mealTool,
                  baseline: baselineSelection,
                  endline: endlineSelection,
                };

                reqForConfirmationModelFunc(
                  IsCreateMode(mode)
                    ? MealToolCreationMessage
                    : MealToolEditionMessage,
                  () => handleSubmitMealtoolForm(submittedMealTool)
                );
              }}
              className="
                bg-primary
                text-primary-foreground
                hover:bg-primary/90
                shadow-md
                font-medium
                rounded-md
                h-10
                text-xs
                min-w-[120px]
                flex
                items-center
                justify-center
                gap-2
              "
            >
              {loading ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  <span>Saving...</span>
                </>
              ) : IsCreateMode(mode) ? (
                "Save Meal Tool"
              ) : (
                "Update Meal Tool"
              )}
            </Button>
          </div>
        )}

        {IsShowMode(mode) && (
          <div className="flex justify-end gap-3 pt-4 border-t border-border mt-auto">
            <Button
              variant="outline"
              type="button"
              onClick={() => onOpenChange(false)}
              className="
                bg-secondary
                text-secondary-foreground
                hover:bg-secondary/80
                rounded-md
                h-10
                text-xs
                font-medium
              "
            >
              Close
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default MealToolForm;
