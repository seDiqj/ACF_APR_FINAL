"use client";

import * as React from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { SingleSelect } from "../single-select";
import { useEffect, useState } from "react";
import { useParentContext } from "@/contexts/ParentContext";
import { withPermission } from "@/lib/withPermission";
import { PsychoeducationFormSchema } from "@/schemas/FormsSchema";
import { PsychoeducationForm } from "@/types/Types";
import { PsychoeducationDefault } from "@/constants/FormsDefaultValues";
import {
  PsychoeducationCreationMessage,
  PsychoeducationEditionMessage,
} from "@/constants/ConfirmationModelsTexts";
import { PsychoeducationFormInterface } from "@/interfaces/Interfaces";
import {
  IsCreateMode,
  IsEditMode,
  IsNotShowMode,
  IsShowMode,
} from "@/constants/Constants";
import { SUBMIT_BUTTON_PROVIDER_ID } from "@/config/System";
import { AxiosError, AxiosResponse } from "axios";
import { toDateOnly } from "./MainDatabaseBeneficiaryCreationForm";
import { Brain, Info, Landmark, Loader2, Users, X } from "lucide-react";
import { cn } from "@/lib/utils";

const CreatePsychoeducation: React.FC<PsychoeducationFormInterface> = ({
  open,
  onOpenChange,
  mode,
  psychoeducationId,
}) => {
  const {
    reqForToastAndSetMessage,
    requestHandler,
    handleReload,
    reqForConfirmationModelFunc,
  } = useParentContext();

  const [formData, setFormData] = useState<PsychoeducationForm>(
    PsychoeducationDefault()
  );

  const [formErrors, setFormErrors] = useState<{
    programInformation: { [key: string]: string };
    psychoeducationInformation: { [key: string]: string };
  }>({
    programInformation: {},
    psychoeducationInformation: {},
  });

  const [indicators, setIndicators] = useState<
    { id: string; indicatorRef: string }[]
  >([]);

  const [districts, setDistricts] = useState<{ id: string; name: string }[]>(
    []
  );

  const [provinces, setProvinces] = useState<{ id: string; name: string }[]>(
    []
  );

  const [projects, setProjects] = useState<
    { id: string; projectCode: string }[]
  >([]);

  const [isLoading, setIsLoading] = useState<boolean>(false);

  const [registrationDateValidRange, setRegistrationDateValidRange] = useState<{
    start: string;
    end: string;
  }>({
    start: "2025-01-01",
    end: "2025-02-01",
  });

  const readOnly: boolean = IsShowMode(mode);

  const handleFormChange = (e: any, part: "program" | "psychoeducation") => {
    const { name, value } = e.target;

    if (part === "program") {
      setFormData((prev) => ({
        ...prev,
        programInformation: {
          ...prev.programInformation,
          [name]: value,
        },
      }));

      if (formErrors.programInformation[name]) {
        setFormErrors((prev) => {
          const next = {
            ...prev,
            programInformation: {
              ...prev.programInformation,
            },
          };

          delete next.programInformation[name];
          return next;
        });
      }
    } else {
      setFormData((prev) => ({
        ...prev,
        psychoeducationInformation: {
          ...prev.psychoeducationInformation,
          [name]: value,
        },
      }));

      if (formErrors.psychoeducationInformation[name]) {
        setFormErrors((prev) => {
          const next = {
            ...prev,
            psychoeducationInformation: {
              ...prev.psychoeducationInformation,
            },
          };

          delete next.psychoeducationInformation[name];
          return next;
        });
      }
    }
  };

  const handleSubmit = () => {
    const result = PsychoeducationFormSchema.safeParse(formData);

    if (!result.success) {
      const errors: {
        programInformation: { [key: string]: string };
        psychoeducationInformation: { [key: string]: string };
        [key: string]: { [key: string]: string };
      } = {
        programInformation: {},
        psychoeducationInformation: {},
      };

      result.error.issues.forEach((issue) => {
        if (issue.path.length === 2) {
          const [parent, child] = issue.path;

          if (!errors[parent as string]) {
            errors[parent as string] = {};
          }

          errors[parent as string][child as string] = issue.message;
        }
      });

      setFormErrors({
        programInformation: errors.programInformation,
        psychoeducationInformation: errors.psychoeducationInformation,
      });

      reqForToastAndSetMessage(
        "Please fix validation errors before submitting.",
        "warning"
      );

      return;
    }

    setFormErrors({
      programInformation: {},
      psychoeducationInformation: {},
    });


    setIsLoading(true);

    if (IsCreateMode(mode)) {
      requestHandler()
        .post("/psychoeducation_db/psychoeducation", formData)
        .then((response: any) => {
          reqForToastAndSetMessage(response.data.message, "success");
          onOpenChange(false);
          handleReload();
        })
        .catch((error: any) =>
          reqForToastAndSetMessage(
            error.response?.data?.message || "An error occurred.",
            "error"
          )
        )
        .finally(() => setIsLoading(false));
    } else if (IsEditMode(mode)) {
      requestHandler()
        .put(
          `/psychoeducation_db/psychoeducation/${psychoeducationId}`,
          formData
        )
        .then((response: any) => {
          reqForToastAndSetMessage(response.data.message, "success");
          onOpenChange(false);
          handleReload();
        })
        .catch((error: any) =>
          reqForToastAndSetMessage(
            error.response?.data?.message || "An error occurred.",
            "error"
          )
        )
        .finally(() => setIsLoading(false));
    }
  };

  useEffect(() => {
    if (!open) return;

    requestHandler()
      .get("/projects/p/psychoeducation_database")
      .then((res: any) => {
        setProjects(Object.values(res.data.data));
      })
      .catch((error: any) =>
        reqForToastAndSetMessage(error.response?.data?.message, "error")
      );
  }, [open]);

  useEffect(() => {
    if (!formData.programInformation.project_id) return;

    const projectId = formData.programInformation.project_id;

    requestHandler()
      .get(`projects/indicators/psychoeducation_database/${projectId}`)
      .then((response: any) => setIndicators(response.data.data))
      .catch((error: any) =>
        reqForToastAndSetMessage(error.response?.data?.message, "error")
      );

    requestHandler()
      .get("/global/districts")
      .then((res: any) => setDistricts(Object.values(res.data.data)))
      .catch((error: any) =>
        reqForToastAndSetMessage(error.response?.data?.message, "error")
      );

    requestHandler()
      .get(`projects/provinces/${projectId}`)
      .then((res: any) => setProvinces(Object.values(res.data.data)))
      .catch((error: any) =>
        reqForToastAndSetMessage(error.response?.data?.message, "error")
      );

    requestHandler()
      .get(`/date/project_date_range/${projectId}`)
      .then((response: AxiosResponse<any>) => {
        setRegistrationDateValidRange({
          start: toDateOnly(response.data.data.start),
          end: toDateOnly(response.data.data.end),
        });
      })
      .catch((error: AxiosError<any>) =>
        reqForToastAndSetMessage(error.response?.data?.message, "error")
      );
  }, [formData.programInformation.project_id]);

  useEffect(() => {
    if ((IsEditMode(mode) || IsShowMode(mode)) && psychoeducationId && open) {
      requestHandler()
        .get(`/psychoeducation_db/psychoeducation/${psychoeducationId}`)
        .then((response: any) => {
          const { programData } = response.data.data;

          setFormData({
            programInformation: programData,
            psychoeducationInformation: {
              ...response.data.data.psychoeducationData,
            },
          });
        })
        .catch((error: AxiosError<any>) =>
          reqForToastAndSetMessage(error.response?.data?.message, "error")
        );
    }
  }, [mode, psychoeducationId, open]);

  const inputClass = (hasError?: boolean) =>
    cn(
      "bg-background border-input text-foreground focus-visible:ring-ring h-10 rounded-md text-xs transition-colors",
      hasError && "border-destructive focus-visible:ring-destructive"
    );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="min-w-4xl w-[92vw] max-h-[85vh] flex flex-col p-6 bg-card border border-border text-card-foreground shadow-2xl rounded-lg overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* HEADER */}
        <DialogHeader className="border-b border-border pb-3">
          <DialogTitle className="text-base font-bold text-foreground flex items-center gap-2">
            <Brain className="h-5 w-5 text-primary" />

            {IsCreateMode(mode)
              ? "Create Psychoeducation Record"
              : IsEditMode(mode)
              ? "Edit Psychoeducation Record"
              : "Psychoeducation Details"}
          </DialogTitle>
        </DialogHeader>

        {/* SCROLLABLE CONTENT */}
        <div className="flex-1 overflow-y-auto pr-1 space-y-6 py-4 scrollbar-thin scrollbar-thumb-border">
          {/* =====================================================
              PROGRAM INFORMATION
          ====================================================== */}

          <div className="rounded-lg border border-border/80 p-4 bg-muted/20 space-y-4">
            <div className="text-xs font-bold uppercase tracking-wider text-primary flex items-center gap-2">
              <Landmark className="h-4 w-4" />
              Program Information
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-4 gap-y-3.5">
              {/* PROJECT CODE */}
              <FormField label="Project Code">
                <SingleSelect
                  options={projects.map((project) => ({
                    value: project.id,
                    label: project.projectCode.toUpperCase(),
                  }))}
                  value={formData.programInformation.project_id}
                  onValueChange={(value: string) =>
                    handleFormChange(
                      {
                        target: {
                          name: "project_id",
                          value,
                        },
                      },
                      "program"
                    )
                  }
                  disabled={readOnly}
                  error={formErrors.programInformation.project_id}
                />

                <ErrorMessage
                  error={formErrors.programInformation.project_id}
                />
              </FormField>

              {/* INDICATOR */}
              <FormField label="Select Indicator">
                <SingleSelect
                  options={indicators.map((indicator) => ({
                    value: indicator.id,
                    label: indicator.indicatorRef.toUpperCase(),
                  }))}
                  value={formData.programInformation.indicator_id}
                  onValueChange={(value: string) =>
                    handleFormChange(
                      {
                        target: {
                          name: "indicator_id",
                          value,
                        },
                      },
                      "program"
                    )
                  }
                  disabled={readOnly}
                  error={formErrors.programInformation.indicator_id}
                />

                <ErrorMessage
                  error={formErrors.programInformation.indicator_id}
                />
              </FormField>

              {/* PROGRAM NAME */}
              <FormField label="Program Name">
                <Input
                  name="name"
                  value={formData.programInformation.name}
                  onChange={(e) => handleFormChange(e, "program")}
                  placeholder="Enter program name"
                  disabled={readOnly}
                  className={inputClass(!!formErrors.programInformation.name)}
                />

                <ErrorMessage error={formErrors.programInformation.name} />
              </FormField>

              {/* FOCAL POINT */}
              <FormField label="Focal Point">
                <Input
                  name="focalPoint"
                  value={formData.programInformation.focalPoint}
                  onChange={(e) => handleFormChange(e, "program")}
                  placeholder="Enter focal point"
                  disabled={readOnly}
                  className={inputClass(
                    !!formErrors.programInformation.focalPoint
                  )}
                />

                <ErrorMessage
                  error={formErrors.programInformation.focalPoint}
                />
              </FormField>

              {/* PROVINCE */}
              <FormField label="Province">
                <SingleSelect
                  options={provinces.map((province) => ({
                    value: province.id,
                    label: province.name.toUpperCase(),
                  }))}
                  value={formData.programInformation.province_id}
                  onValueChange={(value: string) =>
                    handleFormChange(
                      {
                        target: {
                          name: "province_id",
                          value,
                        },
                      },
                      "program"
                    )
                  }
                  disabled={readOnly}
                  error={formErrors.programInformation.province_id}
                />

                <ErrorMessage
                  error={formErrors.programInformation.province_id}
                />
              </FormField>

              {/* DISTRICT */}
              <FormField label="District">
                <SingleSelect
                  options={districts.map((district) => ({
                    value: district.id,
                    label: district.name.toUpperCase(),
                  }))}
                  value={formData.programInformation.district_id}
                  onValueChange={(value: string) =>
                    handleFormChange(
                      {
                        target: {
                          name: "district_id",
                          value,
                        },
                      },
                      "program"
                    )
                  }
                  disabled={readOnly}
                  error={formErrors.programInformation.district_id}
                />

                <ErrorMessage
                  error={formErrors.programInformation.district_id}
                />
              </FormField>

              {/* VILLAGE */}
              <FormField label="Village">
                <Input
                  name="village"
                  value={formData.programInformation.village}
                  onChange={(e) => handleFormChange(e, "program")}
                  placeholder="Enter village"
                  disabled={readOnly}
                  className={inputClass(
                    !!formErrors.programInformation.village
                  )}
                />

                <ErrorMessage error={formErrors.programInformation.village} />
              </FormField>

              {/* SITE CODE */}
              <FormField label="Site Code">
                <Input
                  name="siteCode"
                  value={formData.programInformation.siteCode}
                  onChange={(e) => handleFormChange(e, "program")}
                  placeholder="Enter site code"
                  disabled={readOnly}
                  className={inputClass(
                    !!formErrors.programInformation.siteCode
                  )}
                />

                <ErrorMessage error={formErrors.programInformation.siteCode} />
              </FormField>

              {/* HEALTH FACILITY */}
              <FormField label="Health Facility Name">
                <Input
                  name="healthFacilityName"
                  value={formData.programInformation.healthFacilityName}
                  onChange={(e) => handleFormChange(e, "program")}
                  placeholder="Enter health facility name"
                  disabled={readOnly}
                  className={inputClass(
                    !!formErrors.programInformation.healthFacilityName
                  )}
                />

                <ErrorMessage
                  error={formErrors.programInformation.healthFacilityName}
                />
              </FormField>

              {/* INTERVENTION MODALITY */}
              <FormField label="Intervention Modality">
                <Input
                  name="interventionModality"
                  value={formData.programInformation.interventionModality}
                  onChange={(e) => handleFormChange(e, "program")}
                  placeholder="Enter intervention modality"
                  disabled={readOnly}
                  className={inputClass(
                    !!formErrors.programInformation.interventionModality
                  )}
                />

                <ErrorMessage
                  error={formErrors.programInformation.interventionModality}
                />
              </FormField>
            </div>
          </div>

          {/* =====================================================
              PSYCHOEDUCATION INFORMATION
          ====================================================== */}

          <div className="space-y-4">
            <div className="text-xs font-bold uppercase tracking-wider text-primary flex items-center gap-2 border-b border-border/60 pb-2">
              <Brain className="h-4 w-4" />
              Psychoeducation Information
            </div>

            {/* AWARENESS INFORMATION */}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField label="Topic of Awareness">
                <Input
                  name="awarenessTopic"
                  value={formData.psychoeducationInformation.awarenessTopic}
                  onChange={(e) => handleFormChange(e, "psychoeducation")}
                  placeholder="Enter awareness topic"
                  disabled={readOnly}
                  className={inputClass(
                    !!formErrors.psychoeducationInformation.awarenessTopic
                  )}
                />

                <ErrorMessage
                  error={formErrors.psychoeducationInformation.awarenessTopic}
                />
              </FormField>

              <FormField label="Date of Awareness">
                <Input
                  type="date"
                  name="awarenessDate"
                  value={formData.psychoeducationInformation.awarenessDate}
                  onChange={(e) => handleFormChange(e, "psychoeducation")}
                  disabled={readOnly || !formData.programInformation.project_id}
                  min={registrationDateValidRange.start}
                  max={registrationDateValidRange.end}
                  className={inputClass(
                    !!formErrors.psychoeducationInformation.awarenessDate
                  )}
                />

                <ErrorMessage
                  error={formErrors.psychoeducationInformation.awarenessDate}
                />
              </FormField>
            </div>

            {/* =====================================================
                DEMOGRAPHICS
            ====================================================== */}

            <div className="rounded-lg border border-border/80 p-4 bg-muted/20 space-y-5">
              <div className="text-xs font-bold uppercase tracking-wider text-primary flex items-center gap-2">
                <Users className="h-4 w-4" />
                Participant Demographics
              </div>

              <DemographicLine
                title="Number of Men"
                prefix="ofMen"
                formData={formData}
                formChangeHandler={handleFormChange}
                readonly={readOnly}
                errors={formErrors.psychoeducationInformation}
              />

              <DemographicLine
                title="Number of Women"
                prefix="ofWomen"
                formData={formData}
                formChangeHandler={handleFormChange}
                readonly={readOnly}
                errors={formErrors.psychoeducationInformation}
              />

              <DemographicLine
                title="Number of Boys"
                prefix="ofBoy"
                formData={formData}
                formChangeHandler={handleFormChange}
                readonly={readOnly}
                errors={formErrors.psychoeducationInformation}
              />

              <DemographicLine
                title="Number of Girls"
                prefix="ofGirl"
                formData={formData}
                formChangeHandler={handleFormChange}
                readonly={readOnly}
                errors={formErrors.psychoeducationInformation}
              />
            </div>

            {/* REMARK */}

            <div className="flex flex-col gap-1.5">
              <Label className="text-xs font-semibold text-muted-foreground">
                Remark
              </Label>

              <Textarea
                name="remark"
                value={formData.psychoeducationInformation.remark}
                onChange={(e) => handleFormChange(e, "psychoeducation")}
                placeholder="Write your remark here..."
                disabled={readOnly}
                className={cn(
                  "bg-background border-input text-foreground focus-visible:ring-ring min-h-[110px] rounded-md text-xs resize-none",
                  formErrors.psychoeducationInformation.remark &&
                    "border-destructive focus-visible:ring-destructive"
                )}
              />

              <ErrorMessage
                error={formErrors.psychoeducationInformation.remark}
              />
            </div>
          </div>
        </div>

        {/* =====================================================
            FOOTER
        ====================================================== */}

        <div className="flex justify-end gap-3 pt-4 border-t border-border mt-auto">
          <Button
            variant="outline"
            type="button"
            onClick={() => onOpenChange(false)}
            className="bg-secondary text-secondary-foreground hover:bg-secondary/80 rounded-md h-10 text-xs font-medium flex items-center gap-2"
          >
            <X className="h-3.5 w-3.5" />
            Close
          </Button>

          {IsNotShowMode(mode) && (
            <Button
              id={SUBMIT_BUTTON_PROVIDER_ID}
              disabled={isLoading}
              type="button"
              onClick={() =>
                reqForConfirmationModelFunc(
                  IsCreateMode(mode)
                    ? PsychoeducationCreationMessage
                    : PsychoeducationEditionMessage,
                  () => handleSubmit()
                )
              }
              className="bg-primary text-primary-foreground hover:bg-primary/90 shadow-md font-medium rounded-md h-10 text-xs min-w-[120px] flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  <span>Saving...</span>
                </>
              ) : IsCreateMode(mode) ? (
                "Create Record"
              ) : (
                "Save Changes"
              )}
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

/* ============================================================
   REUSABLE FORM FIELD
============================================================ */

function FormField({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <Label className="text-xs font-semibold text-muted-foreground">
        {label}
      </Label>

      {children}
    </div>
  );
}

/* ============================================================
   ERROR MESSAGE
============================================================ */

function ErrorMessage({ error }: { error?: string }) {
  if (!error) return null;

  return (
    <span className="text-[10px] font-medium text-destructive flex items-center gap-1 mt-0.5 animate-in fade-in">
      <Info className="h-3 w-3" />
      {error}
    </span>
  );
}

/* ============================================================
   DEMOGRAPHIC LINE
============================================================ */

function DemographicLine({
  title,
  prefix,
  formData,
  formChangeHandler,
  readonly,
  errors,
}: {
  title: string;

  prefix: "ofMen" | "ofWomen" | "ofBoy" | "ofGirl";

  formData: PsychoeducationForm;

  formChangeHandler: (e: any, part: "program" | "psychoeducation") => void;

  readonly: boolean;

  errors: {
    [key: string]: string;
  };
}) {
  const fields = [
    {
      label: "Host Community",
      name:
        prefix === "ofMen"
          ? "ofMenHostCommunity"
          : prefix === "ofWomen"
          ? "ofWomenHostCommunity"
          : prefix === "ofBoy"
          ? "ofBoyHostCommunity"
          : "ofGirlHostCommunity",
    },
    {
      label: "IDP",
      name:
        prefix === "ofMen"
          ? "ofMenIdp"
          : prefix === "ofWomen"
          ? "ofWomenIdp"
          : prefix === "ofBoy"
          ? "ofBoyIdp"
          : "ofGirlIdp",
    },
    {
      label: "Refugee",
      name:
        prefix === "ofMen"
          ? "ofMenRefugee"
          : prefix === "ofWomen"
          ? "ofWomenRefugee"
          : prefix === "ofBoy"
          ? "ofBoyRefugee"
          : "ofGirlRefugee",
    },
    {
      label: "Returnee",
      name:
        prefix === "ofMen"
          ? "ofMenReturnee"
          : prefix === "ofWomen"
          ? "ofWomenReturnee"
          : prefix === "ofBoy"
          ? "ofBoyReturnee"
          : "ofGirlReturnee",
    },
  ] as const;

  return (
    <div className="space-y-3 border-b border-border/50 pb-5 last:border-b-0 last:pb-0">
      <div className="text-xs font-semibold text-foreground">{title}</div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {fields.map((field) => {
          const hasError = !!errors[field.name];

          return (
            <div key={field.name} className="flex flex-col gap-1.5">
              <Label className="text-xs font-medium text-muted-foreground">
                {field.label}
              </Label>

              <Input
                type="number"
                min="0"
                name={field.name}
                value={formData.psychoeducationInformation[field.name] ?? ""}
                onChange={(e) => formChangeHandler(e, "psychoeducation")}
                placeholder="Enter value"
                disabled={readonly}
                className={cn(
                  "bg-background border-input text-foreground focus-visible:ring-ring h-10 rounded-md text-xs transition-colors",
                  hasError &&
                    "border-destructive focus-visible:ring-destructive"
                )}
              />

              {hasError && <ErrorMessage error={errors[field.name]} />}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default withPermission(CreatePsychoeducation, "Psychoeducation.create");
