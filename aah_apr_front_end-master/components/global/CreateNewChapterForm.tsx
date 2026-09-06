"use client";
import * as React from "react";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { AxiosError, AxiosResponse } from "axios";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useParentContext } from "@/contexts/ParentContext";
import { ChapterForm } from "@/types/Types";
import { ChapterDefault } from "@/constants/FormsDefaultValues";
import { ChapterCreationMessage } from "@/constants/ConfirmationModelsTexts";
import { ChapterFormInterface } from "@/interfaces/Interfaces";
import { SUBMIT_BUTTON_PROVIDER_ID } from "@/config/System";
import {
  IsANullOrUndefinedValue,
  IsCreateMode,
  IsEditMode,
  IsNotEditMode,
  IsNotShowMode,
} from "@/constants/Constants";
import { ChapterFormSchema } from "@/schemas/FormsSchema";
import { Info, Loader2, BookOpen } from "lucide-react";
import { cn } from "@/lib/utils";
const CreateNewChapterForm: React.FC<ChapterFormInterface> = ({
  open,
  onOpenChange,
  title,
  chaptersDataStateSetter,
  mode,
  chapterId,
}) => {
  const { id } = useParams<{ id: string }>();
  const {
    reqForToastAndSetMessage,
    requestHandler,
    reqForConfirmationModelFunc,
  } = useParentContext();
  const [formData, setFormData] = useState<ChapterForm>(ChapterDefault());
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState<boolean>(false);
  /** * Clear individual field error */ const clearFieldError = (
    fieldName: string
  ) => {
    setFormErrors((prev) => {
      if (!prev[fieldName]) return prev;
      const updated = { ...prev };
      delete updated[fieldName];
      return updated;
    });
  };
  /** * Handle input changes */ const handleFormChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    clearFieldError(name);
  };
  /** * Load chapter when editing */ useEffect(() => {
    if (!open) return;
    setFormErrors({});
    if (IsCreateMode(mode)) {
      setFormData(ChapterDefault());
      return;
    }
    if (
      (IsNotEditMode(mode) && IsNotShowMode(mode)) ||
      IsANullOrUndefinedValue(chapterId)
    ) {
      return;
    }
    requestHandler()
      .get(`/training_db/training/chapter/${chapterId}`)
      .then((response: AxiosResponse<any, any>) => {
        setFormData(response.data.data);
      })
      .catch((error: AxiosError<any, any>) => {
        reqForToastAndSetMessage(
          error.response?.data?.message || "Error loading chapter.",
          "error"
        );
      });
  }, [open, mode, chapterId]);
  /** * Validate form */ const validateForm = () => {
    const result = ChapterFormSchema.safeParse(formData);
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
  /** * Submit form */ const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) {
      return;
    }
    setIsLoading(true);
    if (IsCreateMode(mode)) {
      requestHandler()
        .post(`/training_db/training/chapter/${id}`, formData)
        .then((response: AxiosResponse<any, any>) => {
          reqForToastAndSetMessage(response.data.message, "success");
          chaptersDataStateSetter((prev) => [...prev, response.data.data]);
          onOpenChange(false);
        })
        .catch((error: AxiosError<any, any>) =>
          reqForToastAndSetMessage(
            error.response?.data?.message || "Error",
            "error"
          )
        )
        .finally(() => setIsLoading(false));
    } else if (IsEditMode(mode)) {
      requestHandler()
        .put(`/training_db/training/chapter/${chapterId}`, formData)
        .then((response: AxiosResponse<any, any>) => {
          reqForToastAndSetMessage(response.data.message, "success");
          /** * Use returned backend data instead of * the local formData so server-generated fields * remain synchronized. */ chaptersDataStateSetter(
            (prev) =>
              prev.map((chapter) =>
                chapter.id == chapterId ? response.data.data : chapter
              )
          );
          onOpenChange(false);
        })
        .catch((error: AxiosError<any, any>) =>
          reqForToastAndSetMessage(
            error.response?.data?.message || "Error",
            "error"
          )
        )
        .finally(() => setIsLoading(false));
    }
  };
  /** * Field error helper */ const FieldError = ({
    error,
  }: {
    error?: string;
  }) => {
    if (!error) return null;
    return (
      <p className="text-[10px] font-medium text-destructive flex items-center gap-1 mt-0.5">
        {" "}
        <Info className="h-3 w-3 shrink-0" /> {error}{" "}
      </p>
    );
  };
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {" "}
      <DialogContent className=" min-w-4xl w-[92vw] max-h-[85vh] flex flex-col p-6 bg-card border border-border text-card-foreground shadow-2xl rounded-lg overflow-hidden animate-in fade-in zoom-in-95 duration-200 ">
        {" "}
        {/* Header */}{" "}
        <DialogHeader className="border-b border-border pb-3">
          {" "}
          <DialogTitle className="text-base font-bold text-foreground flex items-center gap-2">
            {" "}
            <BookOpen className="h-5 w-5 text-primary" /> {title}{" "}
          </DialogTitle>{" "}
        </DialogHeader>{" "}
        {/* Body */}{" "}
        <div className="flex-1 overflow-y-auto pr-1 space-y-6 py-4 scrollbar-thin scrollbar-thumb-border">
          {" "}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              reqForConfirmationModelFunc(ChapterCreationMessage, () =>
                handleSubmit(e)
              );
            }}
            className="space-y-6"
          >
            {" "}
            {/* Chapter Information */}{" "}
            <section className="rounded-lg border border-border/80 p-4 bg-muted/20 space-y-4">
              {" "}
              <div className="flex items-center gap-2">
                {" "}
                <BookOpen className="h-4 w-4 text-primary" />{" "}
                <h2 className="text-xs font-bold uppercase tracking-wider text-primary">
                  {" "}
                  Chapter Information{" "}
                </h2>{" "}
              </div>{" "}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {" "}
                {/* Topic */}{" "}
                <div className="flex flex-col gap-1">
                  {" "}
                  <Label className="text-xs font-semibold text-muted-foreground">
                    {" "}
                    Chapter Topic{" "}
                  </Label>{" "}
                  <Input
                    name="topic"
                    value={formData.topic ?? ""}
                    onChange={handleFormChange}
                    disabled={isLoading}
                    placeholder="Enter chapter topic"
                    className={cn(
                      "bg-background border-input text-foreground focus-visible:ring-ring h-10 rounded-md text-xs transition-colors",
                      formErrors.topic &&
                        "border-destructive focus-visible:ring-destructive"
                    )}
                  />{" "}
                  <FieldError error={formErrors.topic} />{" "}
                </div>{" "}
                {/* Facilitator Name */}{" "}
                <div className="flex flex-col gap-1">
                  {" "}
                  <Label className="text-xs font-semibold text-muted-foreground">
                    {" "}
                    Facilitator Name{" "}
                  </Label>{" "}
                  <Input
                    name="facilitatorName"
                    value={formData.facilitatorName ?? ""}
                    onChange={handleFormChange}
                    disabled={isLoading}
                    placeholder="Enter facilitator name"
                    className={cn(
                      "bg-background border-input text-foreground focus-visible:ring-ring h-10 rounded-md text-xs transition-colors",
                      formErrors.facilitatorName &&
                        "border-destructive focus-visible:ring-destructive"
                    )}
                  />{" "}
                  <FieldError error={formErrors.facilitatorName} />{" "}
                </div>{" "}
                {/* Facilitator Job Title */}{" "}
                <div className="flex flex-col gap-1">
                  {" "}
                  <Label className="text-xs font-semibold text-muted-foreground">
                    {" "}
                    Facilitator Job Title{" "}
                  </Label>{" "}
                  <Input
                    name="facilitatorJobTitle"
                    value={formData.facilitatorJobTitle ?? ""}
                    onChange={handleFormChange}
                    disabled={isLoading}
                    placeholder="Enter facilitator job title"
                    className={cn(
                      "bg-background border-input text-foreground focus-visible:ring-ring h-10 rounded-md text-xs transition-colors",
                      formErrors.facilitatorJobTitle &&
                        "border-destructive focus-visible:ring-destructive"
                    )}
                  />{" "}
                  <FieldError error={formErrors.facilitatorJobTitle} />{" "}
                </div>{" "}
                {/* Start Date */}{" "}
                <div className="flex flex-col gap-1">
                  {" "}
                  <Label className="text-xs font-semibold text-muted-foreground">
                    {" "}
                    Start Date{" "}
                  </Label>{" "}
                  <Input
                    type="date"
                    name="startDate"
                    value={formData.startDate ?? ""}
                    onChange={handleFormChange}
                    disabled={isLoading}
                    className={cn(
                      "bg-background border-input text-foreground focus-visible:ring-ring h-10 rounded-md text-xs transition-colors",
                      formErrors.startDate &&
                        "border-destructive focus-visible:ring-destructive"
                    )}
                  />{" "}
                  <FieldError error={formErrors.startDate} />{" "}
                </div>{" "}
                {/* End Date */}{" "}
                <div className="flex flex-col gap-1">
                  {" "}
                  <Label className="text-xs font-semibold text-muted-foreground">
                    {" "}
                    End Date{" "}
                  </Label>{" "}
                  <Input
                    type="date"
                    name="endDate"
                    value={formData.endDate ?? ""}
                    onChange={handleFormChange}
                    disabled={isLoading}
                    className={cn(
                      "bg-background border-input text-foreground focus-visible:ring-ring h-10 rounded-md text-xs transition-colors",
                      formErrors.endDate &&
                        "border-destructive focus-visible:ring-destructive"
                    )}
                  />{" "}
                  <FieldError error={formErrors.endDate} />{" "}
                </div>{" "}
              </div>{" "}
            </section>{" "}
            {/* Footer */}{" "}
            <div className="flex justify-end gap-3 pt-4 border-t border-border mt-auto">
              {" "}
              <Button
                type="button"
                variant="outline"
                disabled={isLoading}
                onClick={() => onOpenChange(false)}
                className="h-10 px-4 text-xs bg-secondary/50 hover:bg-secondary border-border"
              >
                {" "}
                Cancel{" "}
              </Button>{" "}
              <Button
                id={SUBMIT_BUTTON_PROVIDER_ID}
                type="submit"
                disabled={isLoading}
                className="h-10 px-5 text-xs"
              >
                {" "}
                {isLoading ? (
                  <>
                    {" "}
                    <Loader2 className="h-4 w-4 animate-spin mr-2" /> Saving...{" "}
                  </>
                ) : (
                  "Save"
                )}{" "}
              </Button>{" "}
            </div>{" "}
          </form>{" "}
        </div>{" "}
      </DialogContent>{" "}
    </Dialog>
  );
};
export default CreateNewChapterForm;
