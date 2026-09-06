"use client";

import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { cardsBottomButtons } from "./CardsBottomButtons";
import { Input } from "@/components/ui/input";
import { MultiSelect } from "@/components/multi-select";
import { SingleSelect } from "@/components/single-select";
import React, { useState } from "react";
import { useParentContext } from "@/contexts/ParentContext";
import { ProjectFormSchema } from "@/schemas/FormsSchema";
import { useProjectContext } from "../create_new_project/page";
import { Project, Outcome } from "../types/Types";
import { useProjectEditContext } from "../edit_project/[id]/page";
import { useProjectShowContext } from "../project_show/[id]/page";
import { IsCreateMode, IsEditMode, IsShowMode } from "@/constants/Constants";
import { ProjectFormInterface } from "@/interfaces/Interfaces";
import {
  ProjectStatusOptions,
  ProvinceOptions,
  SectorOptions,
} from "@/constants/SingleAndMultiSelectOptionsList";
import { FolderKanban } from "lucide-react";

const ProjectForm: React.FC<ProjectFormInterface> = ({ mode }) => {
  const { reqForToastAndSetMessage, requestHandler } = useParentContext();
  const {
    projectId,
    setProjectId,
    setCurrentTab,
    setProjectProvinces,
    formData,
    setFormData,
    setOutcomes,
  }: {
    projectId: number | null;
    setCurrentTab: (value: string) => void;
    setProjectId: React.Dispatch<React.SetStateAction<string>>;
    setProjectProvinces: React.Dispatch<React.SetStateAction<string[]>>;
    formData: Project;
    setFormData: React.Dispatch<React.SetStateAction<Project>>;
    setOutcomes: React.Dispatch<React.SetStateAction<Outcome[]>>;
  } = IsCreateMode(mode)
    ? useProjectContext()
    : IsShowMode(mode)
      ? useProjectShowContext()
      : useProjectEditContext();

  const [formErrors, setFormErrors] = useState<{ [key: string]: string }>({});
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const hundleFormChange = (e: any) => {
    const name: string = e.target.name;
    const value: string = e.target.value;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const hundleSubmit = () => {
    const result = ProjectFormSchema.safeParse(formData);

    if (!result.success) {
      const errors: { [key: string]: string } = {};
      result.error.issues.forEach((issue) => {
        const field = issue.path[0];
        if (field) errors[field as string] = issue.message;
      });

      setFormErrors(errors);
      reqForToastAndSetMessage(
        "Please fix validation errors before submitting.",
        "warning",
      );
      return;
    }

    setFormErrors({});
    setIsLoading(true);

    if (IsCreateMode(mode)) {
      requestHandler()
        .post("/projects", formData)
        .then((response: any) => {
          setProjectId(response.data.data.project.id);
          setOutcomes((prev) => [...prev, response.data.data.outcome]);
          reqForToastAndSetMessage(response.data.message, "success");
        })
        .catch((error: any) => {
          reqForToastAndSetMessage(error.response.data.message, "error");
        })
        .finally(() => setIsLoading(false));
      return;
    }

    if (IsEditMode(mode)) {
      requestHandler()
        .post(`projects/${projectId}`, formData)
        .then((response: any) =>
          reqForToastAndSetMessage(response.data.message),
        )
        .catch((error: any) =>
          reqForToastAndSetMessage(error.response.data.message),
        )
        .finally(() => setIsLoading(false));
    }
  };

  const readOnly = IsShowMode(mode);

  return (
    <>
      <Card className="h-full border border-border bg-card shadow-sm flex flex-col rounded-xl overflow-hidden min-h-[550px]">
        <CardContent className="p-6 overflow-y-auto flex-1 no-scrollbar">
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
            {/* Project Code */}
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="projectCode" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Project Code</Label>
              <Input
                id="projectCode"
                name="projectCode"
                value={formData.projectCode}
                onChange={hundleFormChange}
                className={`h-11 rounded-lg border-input bg-background transition-colors focus:ring-2 focus:ring-primary ${
                  formErrors.projectCode ? "border-destructive focus:ring-destructive" : ""
                }`}
                title={formErrors.projectCode}
                disabled={readOnly}
              />
              {formErrors.projectCode && <span className="text-xs text-destructive font-medium">{formErrors.projectCode}</span>}
            </div>

            {/* Project Donor */}
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="projectDonor" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Donor</Label>
              <Input
                id="projectDonor"
                name="projectDonor"
                value={formData.projectDonor}
                onChange={hundleFormChange}
                className={`h-11 rounded-lg border-input bg-background transition-colors focus:ring-2 focus:ring-primary ${
                  formErrors.projectDonor ? "border-destructive focus:ring-destructive" : ""
                }`}
                title={formErrors.projectDonor}
                disabled={readOnly}
              />
              {formErrors.projectDonor && <span className="text-xs text-destructive font-medium">{formErrors.projectDonor}</span>}
            </div>

            {/* Project Manager */}
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="projectManager" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Project Manager</Label>
              <Input
                id="projectManager"
                name="projectManager"
                value={formData.projectManager}
                onChange={hundleFormChange}
                className={`h-11 rounded-lg border-input bg-background transition-colors focus:ring-2 focus:ring-primary ${
                  formErrors.projectManager ? "border-destructive focus:ring-destructive" : ""
                }`}
                title={formErrors.projectManager}
                disabled={readOnly}
              />
              {formErrors.projectManager && <span className="text-xs text-destructive font-medium">{formErrors.projectManager}</span>}
            </div>

            {/* Project Title */}
            <div className="flex flex-col gap-1.5 sm:col-span-2 xl:col-span-1">
              <Label htmlFor="projectTitle" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Project Title</Label>
              <Textarea
                id="projectTitle"
                name="projectTitle"
                value={formData.projectTitle}
                onChange={hundleFormChange}
                className={`rounded-lg border-input bg-background transition-colors focus:ring-2 focus:ring-primary min-h-[90px] ${
                  formErrors.projectTitle ? "border-destructive focus:ring-destructive" : ""
                }`}
                title={formErrors.projectTitle}
                disabled={readOnly}
              />
              {formErrors.projectTitle && <span className="text-xs text-destructive font-medium">{formErrors.projectTitle}</span>}
            </div>

            {/* Project Goal */}
            <div className="flex flex-col gap-1.5 sm:col-span-2">
              <Label htmlFor="projectGoal" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Project Goal</Label>
              <Textarea
                id="projectGoal"
                name="projectGoal"
                value={formData.projectGoal}
                onChange={hundleFormChange}
                className={`rounded-lg border-input bg-background transition-colors focus:ring-2 focus:ring-primary min-h-[90px] ${
                  formErrors.projectGoal ? "border-destructive focus:ring-destructive" : ""
                }`}
                title={formErrors.projectGoal}
                disabled={readOnly}
              />
              {formErrors.projectGoal && <span className="text-xs text-destructive font-medium">{formErrors.projectGoal}</span>}
            </div>
            {/* Start Date */}
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="startDate" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Start Date</Label>
              <Input
                id="startDate"
                name="startDate"
                type="date"
                value={formData.startDate}
                onChange={hundleFormChange}
                className={`h-11 rounded-lg border-input bg-background transition-colors focus:ring-2 focus:ring-primary ${
                  formErrors.startDate ? "border-destructive focus:ring-destructive" : ""
                }`}
                title={formErrors.startDate}
                disabled={readOnly}
              />
              {formErrors.startDate && <span className="text-xs text-destructive font-medium">{formErrors.startDate}</span>}
            </div>

            {/* End Date */}
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="endDate" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">End Date</Label>
              <Input
                id="endDate"
                name="endDate"
                type="date"
                value={formData.endDate}
                onChange={hundleFormChange}
                className={`h-11 rounded-lg border-input bg-background transition-colors focus:ring-2 focus:ring-primary ${
                  formErrors.endDate ? "border-destructive focus:ring-destructive" : ""
                }`}
                title={formErrors.endDate}
                disabled={readOnly}
              />
              {formErrors.endDate && <span className="text-xs text-destructive font-medium">{formErrors.endDate}</span>}
            </div>

            {/* Status */}
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="status" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Status</Label>
              <SingleSelect
                options={ProjectStatusOptions}
                value={formData.status}
                onValueChange={(value: string) => {
                  setFormData((prev) => ({
                    ...prev,
                    status: value,
                  }));
                }}
                placeholder="Project Status"
                error={formErrors.status}
                disabled={readOnly}
              />
            </div>

            {/* Province */}
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="province" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Province</Label>
              <MultiSelect
                options={ProvinceOptions}
                value={formData.provinces}
                onValueChange={(value: string[]) => {
                  setFormData((prev) => ({
                    ...prev,
                    provinces: value,
                  }));
                  setProjectProvinces(value);
                }}
                placeholder="Project Provinces ..."
                error={formErrors.provinces}
                disabled={readOnly}
              />
            </div>

            {/* Thematic Sector */}
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="thematicSector" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Thematic Sector</Label>
              <MultiSelect
                options={SectorOptions}
                value={formData.thematicSector}
                onValueChange={(value: string[]) => {
                  setFormData((prev) => ({
                    ...prev,
                    thematicSector: value,
                  }));
                }}
                placeholder="Project Sector"
                disabled={readOnly}
                error={formErrors.thematicSector}
              />
            </div>

            {/* Reporting Date */}
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="reportingDate" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Reporting Date</Label>
              <Input
                id="reportingDate"
                name="reportingDate"
                value={formData.reportingDate}
                onChange={hundleFormChange}
                type="text"
                className={`h-11 rounded-lg border-input bg-background transition-colors focus:ring-2 focus:ring-primary ${
                  formErrors.reportingDate ? "border-destructive focus:ring-destructive" : ""
                }`}
                title={formErrors.reportingDate}
                disabled={readOnly}
              />
              {formErrors.reportingDate && <span className="text-xs text-destructive font-medium">{formErrors.reportingDate}</span>}
            </div>

            {/* Reporting Period */}
            <div className="flex flex-col gap-1.5 sm:col-span-2 xl:col-span-1">
              <Label htmlFor="reportingPeriod" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Reporting Period</Label>
              <Textarea
                id="reportingPeriod"
                name="reportingPeriod"
                value={formData.reportingPeriod}
                onChange={hundleFormChange}
                className={`rounded-lg border-input bg-background transition-colors focus:ring-2 focus:ring-primary min-h-[80px] ${
                  formErrors.reportingPeriod ? "border-destructive focus:ring-destructive" : ""
                }`}
                title={formErrors.reportingPeriod}
                disabled={readOnly}
              />
              {formErrors.reportingPeriod && <span className="text-xs text-destructive font-medium">{formErrors.reportingPeriod}</span>}
            </div>

            {/* Description */}
            <div className="flex flex-col gap-1.5 col-span-full">
              <Label htmlFor="description" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Description</Label>
              <Textarea
                placeholder="Type your message here."
                id="description"
                name="description"
                value={formData.description}
                onChange={hundleFormChange}
                className={`rounded-lg border-input bg-background transition-colors focus:ring-2 focus:ring-primary min-h-[110px] ${
                  formErrors.description ? "border-destructive focus:ring-destructive" : ""
                }`}
                title={formErrors.description}
                disabled={readOnly}
              />
              {formErrors.description && <span className="text-xs text-destructive font-medium">{formErrors.description}</span>}
            </div>
          </div>
        </CardContent>

        {/* دکمه‌های ناوبری استاندارد بدون Absolute Positioning */}
        <CardFooter className="p-6 border-t bg-muted/20 flex justify-end">
          {cardsBottomButtons(
            setCurrentTab,
            "project",
            readOnly ? undefined : hundleSubmit,
            isLoading,
            setCurrentTab,
            "outcome",
            "project",
            mode as "create" | "edit",
            true,
            false,
            !!projectId && IsCreateMode(mode),
          )}
        </CardFooter>
      </Card>
    </>
  );
};

export default ProjectForm;
