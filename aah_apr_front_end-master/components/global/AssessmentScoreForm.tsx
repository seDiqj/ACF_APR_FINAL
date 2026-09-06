"use client";

import { useParentContext } from "@/contexts/ParentContext";
import { Button } from "../ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../ui/dialog";
import { Input } from "../ui/input";
import { Label } from "../ui/label";

import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";

import {
  EnactResetButtonMessage,
  EnactSubmitButtonMessage,
} from "@/constants/ConfirmationModelsTexts";

import { AssessmentScoreFormInterface } from "@/interfaces/Interfaces";
import { Assessments } from "@/types/Types";

import { IsCreateMode, IsEditMode, IsShowMode } from "@/constants/Constants";

import { AxiosError, AxiosResponse } from "axios";

import { SUBMIT_BUTTON_PROVIDER_ID } from "@/config/System";

import DatePicker from "react-datepicker";

import {
  ClipboardCheck,
  CalendarDays,
  Info,
  Loader2,
  RotateCcw,
} from "lucide-react";

import { cn } from "@/lib/utils";

/**
 * Reusable validation message.
 * Keeps all validation messages visually consistent
 * with the other forms.
 */
const FieldError = ({ error }: { error?: string }) => {
  if (!error) return null;

  return (
    <p className="text-[10px] font-medium text-destructive flex items-center gap-1 mt-0.5">
      <Info className="h-3 w-3 shrink-0" />
      {error}
    </p>
  );
};

const AssessmentForm: React.FC<AssessmentScoreFormInterface> = ({
  open,
  onOpenChange,
  mode,
  dateRange,
  exceptMonth,
  assessmentId,
}) => {
  const { id } = useParams<{ id: string }>();

  const {
    reqForToastAndSetMessage,
    requestHandler,
    reqForConfirmationModelFunc,
    handleReload,
  } = useParentContext();

  const [formData, setFormData] = useState<Record<string, number>>({});

  const [assessmentDate, setAssessmentData] = useState<string>("");

  const [assessmentsList, setAssessmentsList] = useState<Assessments>({});

  const [isLoading, setIsLoading] = useState<boolean>(false);

  /**
   * Validation errors
   *
   * assessmentDate -> date validation
   * question id    -> score validation
   */
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  const readOnly = IsShowMode(mode);

  /**
   * Remove a specific validation error.
   */
  const clearFieldError = (fieldName: string) => {
    setFormErrors((prev) => {
      if (!prev[fieldName]) {
        return prev;
      }

      const next = {
        ...prev,
      };

      delete next[fieldName];

      return next;
    });
  };

  /**
   * Handle score changes.
   */
  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    /**
     * Allow empty value while editing.
     */
    if (value === "") {
      setFormData((prev) => ({
        ...prev,
        [name]: 0,
      }));

      clearFieldError(name);

      return;
    }

    const numValue = Number(value);

    if (Number.isNaN(numValue)) {
      return;
    }

    /**
     * Score must be between 0 and 4.
     */
    if (numValue < 0 || numValue > 4) {
      setFormErrors((prev) => ({
        ...prev,
        [name]: "Score must be between 0 and 4.",
      }));

      return;
    }

    setFormData((prev) => ({
      ...prev,
      [name]: numValue,
    }));

    clearFieldError(name);
  };

  /**
   * Reset all scores.
   */
  const handleReset = () => {
    const resetData = Object.keys(formData).reduce((acc, key) => {
      acc[key] = 0;

      return acc;
    }, {} as Record<string, number>);

    setFormData(resetData);
    setFormErrors({});
  };

  /**
   * Validate complete form.
   *
   * Only assessment date is required.
   * Scores are validated separately because
   * their fields are generated dynamically.
   */
  const validateForm = () => {
    const errors: Record<string, string> = {};

    /**
     * Assessment date
     */
    if (!assessmentDate) {
      errors.assessmentDate = "Assessment date is required !";
    }

    /**
     * Validate every score.
     */
    Object.entries(assessmentsList).forEach(([, assessments]) => {
      assessments.forEach((assessment: any) => {
        const fieldName = String(assessment.id);

        const score = formData[assessment.id];

        if (score === undefined || score === null) {
          errors[fieldName] = "Please enter a score.";

          return;
        }

        if (score < 0 || score > 4) {
          errors[fieldName] = "Score must be between 0 and 4.";
        }
      });
    });

    setFormErrors(errors);

    return Object.keys(errors).length === 0;
  };

  /**
   * Submit form.
   */
  const handleSubmit = (e?: React.FormEvent) => {
    if (e?.preventDefault) {
      e.preventDefault();
    }

    if (readOnly) {
      return;
    }

    const isValid = validateForm();

    if (!isValid) {
      reqForToastAndSetMessage(
        "Please resolve the validation errors before submitting.",
        "warning"
      );

      return;
    }

    setIsLoading(true);

    const request = IsCreateMode(mode)
      ? requestHandler().post("/enact_database/assess_assessment", {
          enactId: id,
          scores: formData,
          date: assessmentDate,
        })
      : requestHandler().put(`/enact_database/assessment/${assessmentId}`, {
          scores: formData,
          date: assessmentDate,
        });

    request
      .then((res: AxiosResponse<any>) => {
        reqForToastAndSetMessage(res.data.message, "success");

        setFormErrors({});
        onOpenChange(false);
        handleReload();
      })
      .catch((err: AxiosError<any>) => {
        reqForToastAndSetMessage(
          err.response?.data?.message || "Something went wrong.",
          "error"
        );
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

  /**
   * Calculate total score.
   */
  const totalScore = useMemo(
    () => Object.values(formData).reduce((acc, value) => acc + (value || 0), 0),
    [formData]
  );

  /**
   * Assessment group accent colors.
   */
  const titleColors = ["#1E3A8A", "#059669", "#7C3AED", "#F97316"];

  /**
   * Load assessment structure.
   */
  useEffect(() => {
    if (!open) {
      return;
    }

    requestHandler()
      .get("/enact_database/assessments_list")
      .then((res: AxiosResponse<any>) => {
        const data = res.data.data;

        setAssessmentsList(data);

        if (IsCreateMode(mode)) {
          const initialData: Record<string, number> = {};

          Object.values(data).forEach((list: any) => {
            list.forEach((item: any) => {
              initialData[item.id] = 0;
            });
          });

          setFormData(initialData);
          setAssessmentData("");
          setFormErrors({});
        }
      })
      .catch((err: AxiosError<any>) =>
        reqForToastAndSetMessage(
          err.response?.data?.message || "Error",
          "error"
        )
      );
  }, [mode, open]);

  /**
   * Load existing assessment.
   */
  useEffect(() => {
    if (!open) {
      return;
    }

    if (!assessmentId || (!IsShowMode(mode) && !IsEditMode(mode))) {
      return;
    }

    requestHandler()
      .get(`/enact_database/assessment/${assessmentId}`)
      .then((response: AxiosResponse<any>) => {
        setFormData(
          response.data.data.questions?.reduce(
            (acc: Record<string, number>, question: any) => {
              acc[question.id] = question.score ?? 0;

              return acc;
            },
            {}
          )
        );

        setAssessmentData(response.data.data.date);

        setFormErrors({});
      })
      .catch((error: AxiosError<any>) => {
        reqForToastAndSetMessage(
          error.response?.data?.message || "Unable to load assessment.",
          "error"
        );
      });
  }, [mode, assessmentId, open]);

  /**
   * Filter unavailable months.
   */
  const filterMonths = (date: Date) => {
    const month = date.getMonth() + 1;

    return !exceptMonth.includes(month);
  };

  /**
   * Assessment date change.
   */
  const handleDateChange = (date: Date | null) => {
    if (!date) {
      setAssessmentData("");
      return;
    }

    setAssessmentData(date.toISOString().split("T")[0]);

    clearFieldError("assessmentDate");
  };

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
        {/* =========================
            Header
        ========================== */}
        <DialogHeader className="border-b border-border pb-3">
          <DialogTitle className="text-base font-bold text-foreground flex items-center gap-2">
            <ClipboardCheck className="h-5 w-5 text-primary" />

            {IsCreateMode(mode)
              ? "Create New Assessment"
              : IsEditMode(mode)
              ? "Edit Assessment"
              : "Assessment Details"}
          </DialogTitle>
        </DialogHeader>

        {/* =========================
            Body
        ========================== */}
        <div className="flex-1 overflow-y-auto pr-1 space-y-6 py-4 scrollbar-thin scrollbar-thumb-border">
          <form
            onSubmit={(e) => {
              e.preventDefault();

              if (readOnly) {
                onOpenChange(false);
                return;
              }

              reqForConfirmationModelFunc(EnactSubmitButtonMessage, () =>
                handleSubmit(e)
              );
            }}
            className="space-y-6"
          >
            {/* =========================
                Assessment Date
            ========================== */}
            <section className="rounded-lg border border-border/80 p-4 bg-muted/20 space-y-4">
              <div className="flex items-center gap-2">
                <CalendarDays className="h-4 w-4 text-primary" />

                <h2 className="text-xs font-bold uppercase tracking-wider text-primary">
                  Assessment Information
                </h2>
              </div>

              <div className="flex flex-col gap-1">
                <Label
                  htmlFor="assessment-date"
                  className="text-xs font-semibold text-muted-foreground"
                >
                  Assessment Date
                </Label>

                <DatePicker
                  id="assessment-date"
                  selected={assessmentDate ? new Date(assessmentDate) : null}
                  onChange={handleDateChange}
                  filterDate={filterMonths}
                  minDate={
                    dateRange.startDate
                      ? new Date(dateRange.startDate)
                      : undefined
                  }
                  maxDate={
                    dateRange.endDate ? new Date(dateRange.endDate) : undefined
                  }
                  disabled={readOnly}
                  readOnly={readOnly}
                  placeholderText="Select assessment date"
                  dateFormat="yyyy-MM-dd"
                  className={cn(
                    `
                      bg-background
                      border-input
                      text-foreground
                      h-10
                      rounded-md
                      text-xs
                      transition-colors
                      px-3
                      w-full
                      md:w-64
                      focus:outline-none
                      focus:ring-2
                    `,
                    formErrors.assessmentDate
                      ? `
                        border-destructive
                        focus:ring-destructive
                      `
                      : `
                        focus:border-ring
                        focus:ring-ring
                      `
                  )}
                />

                <FieldError error={formErrors.assessmentDate} />

                {dateRange.startDate && dateRange.endDate && (
                  <p className="text-[10px] text-muted-foreground mt-0.5">
                    Valid range: {dateRange.startDate} to {dateRange.endDate}
                  </p>
                )}
              </div>
            </section>

            {/* =========================
                Assessment Groups
            ========================== */}
            <div className="space-y-4">
              {Object.entries(assessmentsList).map(
                ([groupName, assessments], i) => (
                  <section
                    key={groupName}
                    className="
                      rounded-lg
                      border
                      border-border/80
                      bg-muted/20
                      overflow-hidden
                    "
                  >
                    {/* Group Header */}
                    <div className="px-4 py-3 border-b border-border/60 flex items-center gap-2">
                      <ClipboardCheck
                        className="h-4 w-4"
                        style={{
                          color: titleColors[i % titleColors.length],
                        }}
                      />

                      <h2
                        className="text-xs font-bold uppercase tracking-wider"
                        style={{
                          color: titleColors[i % titleColors.length],
                        }}
                      >
                        {groupName.toUpperCase()}
                      </h2>
                    </div>

                    {/* Questions */}
                    <div className="divide-y divide-border/60">
                      {assessments.map((assessment: any) => {
                        const fieldName = String(assessment.id);

                        const hasError = !!formErrors[fieldName];

                        return (
                          <div
                            key={assessment.id}
                            className={cn(
                              `
                                  px-4
                                  py-4
                                  flex
                                  flex-col
                                  md:flex-row
                                  md:items-center
                                  gap-3
                                  md:gap-6
                                  transition-colors
                                `,
                              hasError && "bg-destructive/5"
                            )}
                          >
                            {/* Question */}
                            <div className="flex-1 min-w-0">
                              <p
                                className={cn(
                                  "text-xs md:text-sm leading-5 text-foreground",
                                  hasError && "text-destructive"
                                )}
                              >
                                {assessment.description}
                              </p>
                            </div>

                            {/* Score */}
                            <div className="w-full md:w-32 shrink-0">
                              <Input
                                id={`assessment-${assessment.id}`}
                                type="number"
                                name={fieldName}
                                value={
                                  formData[assessment.id] !== undefined
                                    ? formData[assessment.id]
                                    : ""
                                }
                                className={cn(
                                  `
                                      bg-background
                                      border-input
                                      text-foreground
                                      focus-visible:ring-ring
                                      h-10
                                      rounded-md
                                      text-sm
                                      text-center
                                      transition-colors
                                    `,
                                  hasError &&
                                    `
                                        border-destructive
                                        focus-visible:ring-destructive
                                      `
                                )}
                                readOnly={readOnly}
                                disabled={readOnly}
                                onChange={handleFormChange}
                                min={0}
                                max={4}
                                step={1}
                                aria-invalid={hasError}
                                aria-describedby={
                                  hasError
                                    ? `error-${assessment.id}`
                                    : undefined
                                }
                              />

                              <div id={`error-${assessment.id}`}>
                                <FieldError error={formErrors[fieldName]} />
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </section>
                )
              )}
            </div>

            {/* =========================
                Total Score
            ========================== */}
            <section className="rounded-lg border border-border/80 bg-muted/20 p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <ClipboardCheck className="h-4 w-4 text-primary" />

                  <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                    Total Score
                  </span>
                </div>

                <span className="text-xl font-bold text-primary">
                  {totalScore}
                </span>
              </div>
            </section>

            {/* =========================
                Footer
            ========================== */}
            {!readOnly ? (
              <div className="flex justify-end gap-3 pt-4 border-t border-border mt-auto">
                <Button
                  type="button"
                  variant="outline"
                  disabled={isLoading}
                  onClick={() =>
                    reqForConfirmationModelFunc(
                      EnactResetButtonMessage,
                      handleReset
                    )
                  }
                  className="
                    h-10
                    px-5
                    text-xs
                    bg-secondary/50
                    hover:bg-secondary
                    border-border
                  "
                >
                  <RotateCcw className="h-3.5 w-3.5 mr-2" />
                  Reset
                </Button>

                <Button
                  id={SUBMIT_BUTTON_PROVIDER_ID}
                  disabled={isLoading}
                  type="submit"
                  className="h-10 px-5 text-xs"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />

                      {IsCreateMode(mode) ? "Saving..." : "Updating..."}
                    </>
                  ) : IsCreateMode(mode) ? (
                    "Save"
                  ) : (
                    "Update"
                  )}
                </Button>
              </div>
            ) : (
              <div className="flex justify-end pt-4 border-t border-border mt-auto">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => onOpenChange(false)}
                  className="
                    h-10
                    px-5
                    text-xs
                    bg-secondary/50
                    hover:bg-secondary
                    border-border
                  "
                >
                  Close
                </Button>
              </div>
            )}
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AssessmentForm;
