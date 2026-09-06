"use client";

import * as React from "react";
import { useEffect, useState } from "react";
import { useParentContext } from "@/contexts/ParentContext";
import { SingleSelect } from "../single-select";
import { Button } from "../ui/button";
import { Dialog, DialogContent, DialogTitle, DialogHeader } from "../ui/dialog";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Skeleton } from "../ui/skeleton";
import { MainDatabaseProgram } from "@/types/Types";
import { withPermission } from "@/lib/withPermission";
import { MainDatabaseProgramFormSchema } from "@/schemas/FormsSchema";
import { MainDatabaseProgramDefault } from "@/constants/FormsDefaultValues";
import {
  MainDatabaseProgramCreationMessage,
  MainDatabaseProgramEditionMessage,
} from "@/constants/ConfirmationModelsTexts";
import { MainDatabaseProgramFormInterface } from "@/interfaces/Interfaces";
import {
  IsCreateMode,
  IsEditMode,
  IsNotShowMode,
  IsShowMode,
} from "@/constants/Constants";
import { SUBMIT_BUTTON_PROVIDER_ID } from "@/config/System";
import { AxiosError } from "axios";
import { Loader2, Info } from "lucide-react";
import { cn } from "@/lib/utils";

const ProgramMainForm: React.FC<MainDatabaseProgramFormInterface> = ({
  open,
  onOpenChange,
  mode,
  programId,
  createdProgramStateSetter,
  programsListStateSetter,
}) => {
  const {
    reqForToastAndSetMessage,
    requestHandler,
    handleReload,
    reqForConfirmationModelFunc,
  } = useParentContext();

  const [formData, setFormData] = useState<MainDatabaseProgram>(
    MainDatabaseProgramDefault()
  );
  const [formErrors, setFormErrors] = useState<{ [key: string]: string }>({});
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isDataFetching, setIsDataFetching] = useState<boolean>(false);

  const [districts, setDistricts] = useState<{ name: string }[]>([]);
  const [provinces, setProvinces] = useState<{ name: string }[]>([]);
  const [projects, setProjects] = useState<
    { id: string; projectCode: string }[]
  >([]);

  const handleFormChange = (e: any) => {
    const name: string = e.target.name;
    const value: string = e.target.value;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (formErrors[name]) {
      setFormErrors((prev) => {
        const next = { ...prev };
        delete next[name];
        return next;
      });
    }
  };

  const handleSubmit = () => {
    const result = MainDatabaseProgramFormSchema.safeParse(formData);
    if (!result.success) {
      const errors: { [key: string]: string } = {};
      result.error.issues.forEach((issue) => {
        const field = issue.path[0];
        if (field) errors[field as string] = issue.message;
      });
      setFormErrors(errors);
      reqForToastAndSetMessage(
        "Please fix validation errors before submitting.",
        "warning"
      );
      return;
    }

    setFormErrors({});
    setIsLoading(true);

    if (IsCreateMode(mode)) {
      requestHandler()
        .post("/global/program/main_database", formData)
        .then((response: any) => {
          reqForToastAndSetMessage(response.data.message, "success");
          if (createdProgramStateSetter) {
            createdProgramStateSetter({
              target: { name: "program", value: response.data.data.id },
            });
          }
          if (programsListStateSetter) {
            programsListStateSetter((prev: any[]) => [
              ...prev,
              { id: response.data.data.id, name: formData.name },
            ]);
          }
          onOpenChange(false);
          handleReload();
        })
        .catch((error: any) =>
          reqForToastAndSetMessage(
            error.response?.data?.message || "Creation failed",
            "error"
          )
        )
        .finally(() => setIsLoading(false));
    } else if (IsEditMode(mode) && programId) {
      requestHandler()
        .put(`/global/program/${programId}`, formData)
        .then((response: any) => {
          reqForToastAndSetMessage(response.data.message, "success");
          onOpenChange(false);
          handleReload();
        })
        .catch((error: any) =>
          reqForToastAndSetMessage(
            error.response?.data?.message || "Update failed",
            "error"
          )
        )
        .finally(() => setIsLoading(false));
    }
  };

  useEffect(() => {
    if (!open) return;
    requestHandler()
      .get("/global/districts")
      .then((res: any) => setDistricts(Object.values(res.data.data)))
      .catch((error: AxiosError<any>) =>
        reqForToastAndSetMessage(
          error.response?.data?.message || "Error districts",
          "error"
        )
      );

    requestHandler()
      .get("/projects/p/main_database")
      .then((res: any) => setProjects(Object.values(res.data.data)))
      .catch((error: any) =>
        reqForToastAndSetMessage(
          error.response?.data?.message || "Error projects",
          "error"
        )
      );
  }, [open]);

  useEffect(() => {
    if (!formData.project_id || !open) return;
    requestHandler()
      .get(`/global/project/provinces/${formData.project_id}`)
      .then((res: any) => setProvinces(Object.values(res.data.data)))
      .catch((error: AxiosError<any>) =>
        reqForToastAndSetMessage(
          error.response?.data?.message || "Error provinces",
          "error"
        )
      );
  }, [formData.project_id, open]);

  useEffect(() => {
    if ((IsEditMode(mode) || IsShowMode(mode)) && programId && open) {
      setIsDataFetching(true);
      requestHandler()
        .get(`/global/program/${programId}`)
        .then((response: any) => setFormData(response.data.data))
        .catch((error: any) =>
          reqForToastAndSetMessage(
            error.response?.data?.message || "Error fetching records",
            "error"
          )
        )
        .finally(() => setIsDataFetching(false));
    } else if (IsCreateMode(mode) && open) {
      setFormData(MainDatabaseProgramDefault());
      setFormErrors({});
    }
  }, [mode, programId, open]);

  const readOnly = IsShowMode(mode);
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl w-[90vw] max-h-[85vh] flex flex-col p-6 bg-card border border-border text-card-foreground shadow-2xl rounded-lg overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <DialogHeader className="border-b border-border pb-4">
          <DialogTitle className="text-xl font-bold tracking-tight text-foreground flex items-center gap-2">
            {/* <FolderJson className="h-5 w-5 text-primary" /> */}
            {IsCreateMode(mode) && "Create New Operational Program"}
            {IsEditMode(mode) && "Modify Program Metrics"}
            {IsShowMode(mode) && "Program Structural Details"}
          </DialogTitle>
        </DialogHeader>

        {isDataFetching ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 py-6 overflow-y-auto flex-1">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="space-y-2">
                <Skeleton className="h-4 w-28 bg-muted" />
                <Skeleton className="h-10 w-full bg-muted rounded-md" />
              </div>
            ))}
          </div>
        ) : (
          <form className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4 py-6 overflow-y-auto flex-1 pr-1 scrollbar-thin scrollbar-thumb-border">
            {/* Project Code */}
            <div className="flex flex-col gap-1.5">
              <Label className="text-xs font-semibold tracking-wide text-muted-foreground">
                Project Code
              </Label>
              <SingleSelect
                options={projects.map((p) => ({
                  value: p.id,
                  label: p.projectCode.toUpperCase(),
                }))}
                value={formData.project_id}
                onValueChange={(value: string) =>
                  handleFormChange({ target: { name: "project_id", value } })
                }
                disabled={readOnly}
                error={formErrors.project_id}
              />
              {formErrors.project_id && (
                <span className="text-[10px] font-medium text-destructive flex items-center gap-1 mt-0.5 animate-in fade-in">
                  <Info className="h-3 w-3" /> {formErrors.project_id}
                </span>
              )}
            </div>

            {/* Program Name */}
            <div className="flex flex-col gap-1.5">
              <Label
                htmlFor="name"
                className="text-xs font-semibold tracking-wide text-muted-foreground"
              >
                Program Name
              </Label>
              <Input
                id="name"
                name="name"
                value={formData.name}
                onChange={handleFormChange}
                disabled={readOnly}
                className={cn(
                  "bg-background border-input text-foreground focus-visible:ring-ring h-10 rounded-md text-xs transition-colors",
                  formErrors.name &&
                    "border-destructive focus-visible:ring-destructive"
                )}
              />
              {formErrors.name && (
                <span className="text-[10px] font-medium text-destructive flex items-center gap-1 mt-0.5 animate-in fade-in">
                  <Info className="h-3 w-3" /> {formErrors.name}
                </span>
              )}
            </div>

            {/* Focal Point */}
            <div className="flex flex-col gap-1.5">
              <Label
                htmlFor="focalPoint"
                className="text-xs font-semibold tracking-wide text-muted-foreground"
              >
                Focal Point
              </Label>
              <Input
                id="focalPoint"
                name="focalPoint"
                value={formData.focalPoint}
                onChange={handleFormChange}
                disabled={readOnly}
                className={cn(
                  "bg-background border-input text-foreground focus-visible:ring-ring h-10 rounded-md text-xs transition-colors",
                  formErrors.focalPoint &&
                    "border-destructive focus-visible:ring-destructive"
                )}
              />
              {formErrors.focalPoint && (
                <span className="text-[10px] font-medium text-destructive flex items-center gap-1 mt-0.5 animate-in fade-in">
                  <Info className="h-3 w-3" /> {formErrors.focalPoint}
                </span>
              )}
            </div>

            {/* Province */}
            <div className="flex flex-col gap-1.5">
              <Label className="text-xs font-semibold tracking-wide text-muted-foreground">
                Province
              </Label>
              <SingleSelect
                options={provinces.map((p) => ({
                  value: p.name,
                  label: p.name.toUpperCase(),
                }))}
                value={formData.province}
                onValueChange={(value: string) =>
                  handleFormChange({ target: { name: "province", value } })
                }
                disabled={readOnly}
                error={formErrors.province}
              />
              {formErrors.province && (
                <span className="text-[10px] font-medium text-destructive flex items-center gap-1 mt-0.5 animate-in fade-in">
                  <Info className="h-3 w-3" /> {formErrors.province}
                </span>
              )}
            </div>
            {/* District */}
            <div className="flex flex-col gap-1.5">
              <Label className="text-xs font-semibold tracking-wide text-muted-foreground">
                District
              </Label>
              <SingleSelect
                options={districts.map((d) => ({
                  value: d.name,
                  label: d.name.toUpperCase(),
                }))}
                value={formData.district}
                onValueChange={(value: string) =>
                  handleFormChange({ target: { name: "district", value } })
                }
                disabled={readOnly}
                error={formErrors.district}
              />
              {formErrors.district && (
                <span className="text-[10px] font-medium text-destructive flex items-center gap-1 mt-0.5 animate-in fade-in">
                  <Info className="h-3 w-3" /> {formErrors.district}
                </span>
              )}
            </div>

            {/* Village */}
            <div className="flex flex-col gap-1.5">
              <Label
                htmlFor="village"
                className="text-xs font-semibold tracking-wide text-muted-foreground"
              >
                Village
              </Label>
              <Input
                id="village"
                name="village"
                value={formData.village}
                onChange={handleFormChange}
                disabled={readOnly}
                className={cn(
                  "bg-background border-input text-foreground focus-visible:ring-ring h-10 rounded-md text-xs transition-colors",
                  formErrors.village &&
                    "border-destructive focus-visible:ring-destructive"
                )}
              />
              {formErrors.village && (
                <span className="text-[10px] font-medium text-destructive flex items-center gap-1 mt-0.5 animate-in fade-in">
                  <Info className="h-3 w-3" /> {formErrors.village}
                </span>
              )}
            </div>

            {/* Site Code */}
            <div className="flex flex-col gap-1.5">
              <Label
                htmlFor="siteCode"
                className="text-xs font-semibold tracking-wide text-muted-foreground"
              >
                Site Code
              </Label>
              <Input
                id="siteCode"
                name="siteCode"
                value={formData.siteCode}
                onChange={handleFormChange}
                disabled={readOnly}
                className={cn(
                  "bg-background border-input text-foreground focus-visible:ring-ring h-10 rounded-md text-xs transition-colors",
                  formErrors.siteCode &&
                    "border-destructive focus-visible:ring-destructive"
                )}
              />
              {formErrors.siteCode && (
                <span className="text-[10px] font-medium text-destructive flex items-center gap-1 mt-0.5 animate-in fade-in">
                  <Info className="h-3 w-3" /> {formErrors.siteCode}
                </span>
              )}
            </div>

            {/* Health Facility Name */}
            <div className="flex flex-col gap-1.5">
              <Label
                htmlFor="healthFacilityName"
                className="text-xs font-semibold tracking-wide text-muted-foreground"
              >
                Health Facility Name
              </Label>
              <Input
                id="healthFacilityName"
                name="healthFacilityName"
                value={formData.healthFacilityName}
                onChange={handleFormChange}
                disabled={readOnly}
                className={cn(
                  "bg-background border-input text-foreground focus-visible:ring-ring h-10 rounded-md text-xs transition-colors",
                  formErrors.healthFacilityName &&
                    "border-destructive focus-visible:ring-destructive"
                )}
              />
              {formErrors.healthFacilityName && (
                <span className="text-[10px] font-medium text-destructive flex items-center gap-1 mt-0.5 animate-in fade-in">
                  <Info className="h-3 w-3" /> {formErrors.healthFacilityName}
                </span>
              )}
            </div>
            {/* Intervention Modality */}
            <div className="flex flex-col gap-1.5 md:col-span-2">
              <Label
                htmlFor="interventionModality"
                className="text-xs font-semibold tracking-wide text-muted-foreground"
              >
                Intervention Modality
              </Label>
              <Input
                id="interventionModality"
                name="interventionModality"
                value={formData.interventionModality}
                onChange={handleFormChange}
                disabled={readOnly}
                className={cn(
                  "bg-background border-input text-foreground focus-visible:ring-ring h-10 rounded-md text-xs transition-colors",
                  formErrors.interventionModality &&
                    "border-destructive focus-visible:ring-destructive"
                )}
              />
              {formErrors.interventionModality && (
                <span className="text-[10px] font-medium text-destructive flex items-center gap-1 mt-0.5 animate-in fade-in">
                  <Info className="h-3 w-3" /> {formErrors.interventionModality}
                </span>
              )}
            </div>
          </form>
        )}

        {/* Submit Actions Bar */}
        {IsNotShowMode(mode) && !isDataFetching && (
          <div className="flex justify-end gap-3 pt-4 border-t border-border mt-auto">
            <Button
              variant="outline"
              type="button"
              onClick={() => onOpenChange(false)}
              className="bg-secondary text-secondary-foreground hover:bg-secondary/80 rounded-md h-10 text-xs font-medium"
            >
              Cancel
            </Button>
            <Button
              id={SUBMIT_BUTTON_PROVIDER_ID}
              disabled={isLoading}
              type="button"
              onClick={() =>
                reqForConfirmationModelFunc(
                  IsCreateMode(mode)
                    ? MainDatabaseProgramCreationMessage
                    : MainDatabaseProgramEditionMessage,
                  () => handleSubmit()
                )
              }
              className="bg-primary text-primary-foreground hover:bg-primary/90 shadow-md font-medium rounded-md h-10 text-xs min-w-[90px] flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  <span>
                    {IsCreateMode(mode) ? "Saving..." : "Updating..."}
                  </span>
                </>
              ) : IsCreateMode(mode) ? (
                "Save Record"
              ) : (
                "Update Changes"
              )}
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default withPermission(ProgramMainForm, "Maindatabase.create");
