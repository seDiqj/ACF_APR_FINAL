"use client";

import { useParentContext } from "@/contexts/ParentContext";
import { SingleSelect } from "../single-select";
import { Button } from "../ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../ui/dialog";
import { Input } from "../ui/input";
import { Label } from "../ui/label";

import { useEffect, useState } from "react";

import { AssessmentFormType } from "@/types/Types";
import { AssessmentFormSchema } from "@/schemas/FormsSchema";

import { AssessmentDefault } from "@/constants/FormsDefaultValues";
import { AssessmentSubmitButtonMessage } from "@/constants/ConfirmationModelsTexts";

import { AssessmentFormInterface } from "@/interfaces/Interfaces";

import {
  IsCreateMode,
  IsEditMode,
  IsEditOrShowMode,
  IsShowMode,
} from "@/constants/Constants";

import { AssessmentTypeOptions } from "@/constants/SingleAndMultiSelectOptionsList";

import { SUBMIT_BUTTON_PROVIDER_ID } from "@/config/System";

import { AxiosError, AxiosResponse } from "axios";

import { toDateOnly } from "./MainDatabaseBeneficiaryCreationForm";

import {
  Info,
  Loader2,
  ClipboardCheck,
  UserRound,
  CalendarDays,
} from "lucide-react";

import { cn } from "@/lib/utils";

/**
 * Reusable validation message.
 * Keeps validation UI consistent with the other forms.
 */
const FieldError = ({ message }: { message?: string }) => {
  if (!message) return null;

  return (
    <p className="text-[10px] font-medium text-destructive flex items-center gap-1 mt-0.5">
      <Info className="h-3 w-3 shrink-0" />
      {message}
    </p>
  );
};

const AssessmentForm: React.FC<AssessmentFormInterface> = ({
  open,
  onOpenChange,
  mode,
  projectId,
}) => {
  const {
    reqForToastAndSetMessage,
    requestHandler,
    reqForConfirmationModelFunc,
    handleReload,
  } = useParentContext();

  const [formData, setFormData] = useState<AssessmentFormType>(
    AssessmentDefault()
  );

  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  const [indicators, setIndicators] = useState<
    {
      id: string;
      indicatorRef: string;
    }[]
  >([]);

  const [provinces, setProvinces] = useState<
    {
      id: string;
      name: string;
    }[]
  >([]);

  const [projects, setProjects] = useState<
    {
      id: string;
      projectCode: string;
    }[]
  >([]);

  const [isLoading, setIsLoading] = useState<boolean>(false);

  const [registrationDateValidRange, setRegistrationDateValidRange] = useState<{
    start: string;
    end: string;
  }>({
    start: "",
    end: "",
  });

  const readOnly = IsShowMode(mode);

  /**
   * Clear one field's validation error.
   */
  const clearFieldError = (fieldName: string) => {
    setFormErrors((prev) => {
      if (!prev[fieldName]) {
        return prev;
      }

      const updatedErrors = {
        ...prev,
      };

      delete updatedErrors[fieldName];

      return updatedErrors;
    });
  };

  /**
   * Handle normal input changes.
   */
  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    clearFieldError(name);
  };

  /**
   * Handle select changes.
   */
  const handleSelectChange = (
    name: keyof AssessmentFormType,
    value: string
  ) => {
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    clearFieldError(name as string);
  };

  /**
   * Handle APR Included radio change.
   */
  const handleAprIncludedChange = (value: string) => {
    setFormData((prev) => ({
      ...prev,
      aprIncluded: value === "true",
    }));

    clearFieldError("aprIncluded");
  };

  /**
   * Validate form.
   */
  const validateForm = () => {
    const result = AssessmentFormSchema.safeParse(formData);

    if (!result.success) {
      const errors: Record<string, string> = {};

      result.error.issues.forEach((issue) => {
        const path = issue.path.join(".");

        if (!errors[path]) {
          errors[path] = issue.message;
        }
      });

      setFormErrors(errors);

      reqForToastAndSetMessage(
        "Please resolve the validation errors before submitting.",
        "warning"
      );

      return false;
    }

    setFormErrors({});

    return true;
  };

  /**
   * Submit form.
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    console.log(formData);
    return;

    setIsLoading(true);

    try {
      /**
       * Create
       */
      if (IsCreateMode(mode)) {
        const response = await requestHandler().post(
          "/enact_database/",
          formData
        );

        reqForToastAndSetMessage(response.data.message, "success");

        onOpenChange(false);
        handleReload();

        return;
      }

      /**
       * Edit
       */
      if (IsEditMode(mode) && projectId) {
        const response = await requestHandler().put(
          `/enact_database/${projectId}`,
          formData
        );

        reqForToastAndSetMessage(response.data.message, "success");

        onOpenChange(false);
        handleReload();

        return;
      }
    } catch (error: any) {
      reqForToastAndSetMessage(
        error.response?.data?.message || "Something went wrong!",
        "error"
      );
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Load assessment in edit/show mode.
   */
  useEffect(() => {
    if (!open) {
      return;
    }

    setFormErrors({});

    if (IsEditOrShowMode(mode) && projectId) {
      requestHandler()
        .get(`/enact_database/${projectId}`)
        .then((response: AxiosResponse<any, any>) => {
          setFormData(response.data.data);
          setFormErrors({});
        })
        .catch((error: AxiosError<any, any>) => {
          reqForToastAndSetMessage(
            error.response?.data?.message || "Failed to load assessment.",
            "error"
          );
        });
    }

    if (IsCreateMode(mode)) {
      setFormData(AssessmentDefault());
      setFormErrors({});
    }
  }, [mode, projectId, open]);

  /**
   * Load projects.
   */
  useEffect(() => {
    requestHandler()
      .get("/projects/p/enact_database")
      .then((response: AxiosResponse<any, any>) => {
        setProjects(Object.values(response.data.data));
      })
      .catch((error: AxiosError<any, any>) => {
        reqForToastAndSetMessage(
          error.response?.data?.message || "Failed to load projects.",
          "error"
        );
      });
  }, []);

  /**
   * Load project-dependent data.
   */
  useEffect(() => {
    if (!formData.project_id) {
      setIndicators([]);
      setProvinces([]);

      setRegistrationDateValidRange({
        start: "",
        end: "",
      });

      return;
    }

    const selectedProjectId = formData.project_id;

    /**
     * Indicators
     */
    requestHandler()
      .get(`projects/indicators/enact_database/${selectedProjectId}`)
      .then((response: AxiosResponse<any, any>) => {
        setIndicators(response.data.data);
      })
      .catch((error: AxiosError<any, any>) => {
        reqForToastAndSetMessage(
          error.response?.data?.message || "Failed to load indicators.",
          "error"
        );
      });

    /**
     * Provinces
     */
    requestHandler()
      .get(`projects/provinces/${selectedProjectId}`)
      .then((response: AxiosResponse<any, any>) => {
        setProvinces(Object.values(response.data.data));
      })
      .catch((error: AxiosError<any, any>) => {
        reqForToastAndSetMessage(
          error.response?.data?.message || "Failed to load provinces.",
          "error"
        );
      });

    /**
     * Valid project date range
     */
    requestHandler()
      .get(`/date/project_date_range/${selectedProjectId}`)
      .then((response: AxiosResponse<any, any>) => {
        setRegistrationDateValidRange({
          start: toDateOnly(response.data.data.start),
          end: toDateOnly(response.data.data.end),
        });
      })
      .catch((error: AxiosError<any, any>) => {
        reqForToastAndSetMessage(
          error.response?.data?.message || "Failed to load date range.",
          "error"
        );
      });
  }, [formData.project_id]);

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

            {IsCreateMode(mode) && "Create New Assessment"}

            {IsEditMode(mode) && "Edit Assessment"}

            {IsShowMode(mode) && "Assessment Details"}
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

              reqForConfirmationModelFunc(AssessmentSubmitButtonMessage, () =>
                handleSubmit(e)
              );
            }}
            className="space-y-6"
          >
            {/* =========================
                Assessment Information
            ========================== */}
            <section className="rounded-lg border border-border/80 p-4 bg-muted/20 space-y-4">
              <div className="flex items-center gap-2">
                <ClipboardCheck className="h-4 w-4 text-primary" />

                <h2 className="text-xs font-bold uppercase tracking-wider text-primary">
                  Assessment Information
                </h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {/* =========================
                    Project Code
                ========================== */}
                <div className="flex flex-col gap-1">
                  <Label
                    htmlFor="project_id"
                    className="text-xs font-semibold text-muted-foreground"
                  >
                    Project Code
                  </Label>

                  <SingleSelect
                    options={projects.map((project) => ({
                      value: project.id,
                      label: project.projectCode.toUpperCase(),
                    }))}
                    value={formData.project_id}
                    onValueChange={(value: string) =>
                      handleSelectChange("project_id", value)
                    }
                    disabled={readOnly}
                    error={formErrors.project_id}
                  />

                  <FieldError message={formErrors.project_id} />
                </div>

                {/* =========================
                    Indicator
                ========================== */}
                <div className="flex flex-col gap-1">
                  <Label
                    htmlFor="indicator_id"
                    className="text-xs font-semibold text-muted-foreground"
                  >
                    Indicator
                  </Label>

                  <SingleSelect
                    options={indicators.map((indicator) => ({
                      value: indicator.id,
                      label: indicator.indicatorRef.toUpperCase(),
                    }))}
                    value={formData.indicator_id}
                    onValueChange={(value: string) =>
                      handleSelectChange("indicator_id", value)
                    }
                    disabled={readOnly}
                    error={formErrors.indicator_id}
                  />

                  <FieldError message={formErrors.indicator_id} />
                </div>

                {/* =========================
                    Province
                ========================== */}
                <div className="flex flex-col gap-1">
                  <Label
                    htmlFor="province_id"
                    className="text-xs font-semibold text-muted-foreground"
                  >
                    Province
                  </Label>

                  <SingleSelect
                    options={provinces.map((province) => ({
                      value: province.id,
                      label: province.name.toUpperCase(),
                    }))}
                    value={formData.province_id}
                    onValueChange={(value: string) =>
                      handleSelectChange("province_id", value)
                    }
                    disabled={readOnly}
                    error={formErrors.province_id}
                  />

                  <FieldError message={formErrors.province_id} />
                </div>

                {/* =========================
                    Councilor Name
                ========================== */}
                <div className="flex flex-col gap-1">
                  <Label
                    htmlFor="councilorName"
                    className="text-xs font-semibold text-muted-foreground"
                  >
                    Councilor Name
                  </Label>

                  <Input
                    id="councilorName"
                    name="councilorName"
                    value={formData.councilorName ?? ""}
                    onChange={handleFormChange}
                    disabled={readOnly}
                    placeholder="Enter councilor name"
                    className={cn(
                      "bg-background border-input text-foreground focus-visible:ring-ring h-10 rounded-md text-xs transition-colors",
                      formErrors.councilorName &&
                        "border-destructive focus-visible:ring-destructive"
                    )}
                  />

                  <FieldError message={formErrors.councilorName} />
                </div>

                {/* =========================
                    Rater Name
                ========================== */}
                <div className="flex flex-col gap-1">
                  <Label
                    htmlFor="raterName"
                    className="text-xs font-semibold text-muted-foreground"
                  >
                    Rater Name
                  </Label>

                  <Input
                    id="raterName"
                    name="raterName"
                    value={formData.raterName ?? ""}
                    onChange={handleFormChange}
                    disabled={readOnly}
                    placeholder="Enter rater name"
                    className={cn(
                      "bg-background border-input text-foreground focus-visible:ring-ring h-10 rounded-md text-xs transition-colors",
                      formErrors.raterName &&
                        "border-destructive focus-visible:ring-destructive"
                    )}
                  />

                  <FieldError message={formErrors.raterName} />
                </div>

                {/* =========================
                    Assessment Type
                ========================== */}
                <div className="flex flex-col gap-1">
                  <Label
                    htmlFor="type"
                    className="text-xs font-semibold text-muted-foreground"
                  >
                    Type Of Assessment
                  </Label>

                  <SingleSelect
                    options={AssessmentTypeOptions}
                    value={formData.type}
                    onValueChange={(value: string) =>
                      handleSelectChange("type", value)
                    }
                    disabled={readOnly}
                    error={formErrors.type}
                  />

                  <FieldError message={formErrors.type} />
                </div>
              </div>
            </section>

            {/* =========================
                Assessment Details
            ========================== */}
            <section className="rounded-lg border border-border/80 p-4 bg-muted/20 space-y-4">
              <div className="flex items-center gap-2">
                <CalendarDays className="h-4 w-4 text-primary" />

                <h2 className="text-xs font-bold uppercase tracking-wider text-primary">
                  Assessment Details
                </h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* =========================
                    Assessment Date
                ========================== */}
                <div className="flex flex-col gap-1">
                  <Label
                    htmlFor="date"
                    className="text-xs font-semibold text-muted-foreground"
                  >
                    Date Of Assessment
                  </Label>

                  <Input
                    id="date"
                    name="date"
                    type="date"
                    value={formData.date ?? ""}
                    onChange={handleFormChange}
                    disabled={readOnly || !formData.project_id}
                    min={registrationDateValidRange.start}
                    max={registrationDateValidRange.end}
                    className={cn(
                      "bg-background border-input text-foreground focus-visible:ring-ring h-10 rounded-md text-xs transition-colors",
                      formErrors.date &&
                        "border-destructive focus-visible:ring-destructive"
                    )}
                  />

                  <FieldError message={formErrors.date} />

                  {formData.project_id &&
                    registrationDateValidRange.start &&
                    registrationDateValidRange.end && (
                      <p className="text-[10px] text-muted-foreground">
                        Valid range: {registrationDateValidRange.start} to{" "}
                        {registrationDateValidRange.end}
                      </p>
                    )}
                </div>

                {/* =========================
                    APR Included
                ========================== */}
                <div className="flex flex-col gap-1">
                  <Label className="text-xs font-semibold text-muted-foreground">
                    APR Included
                  </Label>

                  <div className="flex items-center gap-3 h-10">
                    <label
                      className="
                        flex
                        items-center
                        gap-2
                        cursor-pointer
                        text-xs
                        font-medium
                        text-foreground
                      "
                    >
                      <input
                        type="radio"
                        name="aprIncluded"
                        value="true"
                        checked={formData.aprIncluded === true}
                        onChange={() => handleAprIncludedChange("true")}
                        disabled={readOnly}
                        className="h-4 w-4 accent-primary"
                      />
                      Yes
                    </label>

                    <label
                      className="
                        flex
                        items-center
                        gap-2
                        cursor-pointer
                        text-xs
                        font-medium
                        text-foreground
                      "
                    >
                      <input
                        type="radio"
                        name="aprIncluded"
                        value="false"
                        checked={formData.aprIncluded === false}
                        onChange={() => handleAprIncludedChange("false")}
                        disabled={readOnly}
                        className="h-4 w-4 accent-primary"
                      />
                      No
                    </label>
                  </div>

                  <FieldError message={formErrors.aprIncluded} />
                </div>
              </div>
            </section>

            {/* =========================
                Footer
            ========================== */}
            <div className="flex justify-end gap-3 pt-4 border-t border-border mt-auto">
              {IsShowMode(mode) ? (
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
              ) : (
                <>
                  <Button
                    type="button"
                    variant="outline"
                    disabled={isLoading}
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
                    Cancel
                  </Button>

                  <Button
                    id={SUBMIT_BUTTON_PROVIDER_ID}
                    type="submit"
                    disabled={isLoading}
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
                </>
              )}
            </div>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AssessmentForm;
