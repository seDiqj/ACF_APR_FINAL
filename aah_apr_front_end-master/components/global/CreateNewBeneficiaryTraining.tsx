"use client";
import * as React from "react";
import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { SingleSelect } from "../single-select";
import { useParentContext } from "@/contexts/ParentContext";
import { TrainingBenefeciaryForm } from "@/types/Types";
import { TrainingDatabaseBenefeciaryFormSchema } from "@/schemas/FormsSchema";
import { TrainingBeneficiaryDefault } from "@/constants/FormsDefaultValues";
import { TrainingBeneficiaryCreationMessage } from "@/constants/ConfirmationModelsTexts";
import { TrainingBeneficiaryFormInterface } from "@/interfaces/Interfaces";
import { GenderOptions } from "@/constants/SingleAndMultiSelectOptionsList";
import { IsEditMode, IsNotANullOrUndefinedValue } from "@/constants/Constants";
import { SUBMIT_BUTTON_PROVIDER_ID } from "@/config/System";
import { Info, Loader2, UserRound } from "lucide-react";
/* -------------------------------------------------------------------------- */ /* Field Error */ /* -------------------------------------------------------------------------- */ const FieldError =
  ({ message }: { message?: string }) => {
    if (!message) return null;
    return (
      <p className="text-[10px] font-medium text-destructive flex items-center gap-1 mt-0.5">
        {" "}
        <Info className="h-3 w-3 shrink-0" /> {message}{" "}
      </p>
    );
  };
/* -------------------------------------------------------------------------- */ /* Main Component */ /* -------------------------------------------------------------------------- */ const TrainingBeneficiaryForm: React.FC<
  TrainingBeneficiaryFormInterface
> = ({ open, onOpenChange, title, mode, editId }) => {
  const {
    reqForToastAndSetMessage,
    requestHandler,
    handleReload,
    reqForConfirmationModelFunc,
  } = useParentContext();
  /* ------------------------------------------------------------------------ */ /* States */ /* ------------------------------------------------------------------------ */ const [
    loading,
    setLoading,
  ] = useState<boolean>(false);
  const [formData, setFormData] = useState<TrainingBenefeciaryForm>(
    TrainingBeneficiaryDefault()
  );
  const [formErrors, setFormErrors] = useState<{ [key: string]: string }>({});
  /* ------------------------------------------------------------------------ */ /* Helper Functions */ /* ------------------------------------------------------------------------ */ const clearFieldError =
    (field: string) => {
      setFormErrors((prev) => {
        if (!prev[field]) return prev;
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    };
  /* ------------------------------------------------------------------------ */ /* Load Beneficiary */ /* ------------------------------------------------------------------------ */ useEffect(() => {
    if (IsEditMode(mode) && IsNotANullOrUndefinedValue(editId)) {
      setLoading(true);
      requestHandler()
        .get(`/training_db/beneficiary/${editId}`)
        .then((response: any) => {
          setFormData(response.data.data);
          setFormErrors({});
        })
        .catch((error: any) => {
          reqForToastAndSetMessage(
            error.response?.data?.message || "Failed to load beneficiary data!",
            "error"
          );
        })
        .finally(() => {
          setLoading(false);
        });
    }
  }, [mode, editId]);
  /* ------------------------------------------------------------------------ */ /* Form Change */ /* ------------------------------------------------------------------------ */ const handleFormChange =
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const { name, value } = e.target;
      setFormData((prev) => ({ ...prev, [name]: value }));
      clearFieldError(name);
    };
  /* ------------------------------------------------------------------------ */ /* Gender Change */ /* ------------------------------------------------------------------------ */ const handleGenderChange =
    (value: string) => {
      setFormData((prev) => ({ ...prev, gender: value }));
      clearFieldError("gender");
    };
  /* ------------------------------------------------------------------------ */ /* Submit Form */ /* ------------------------------------------------------------------------ */ const handleSubmit =
    async () => {
      const result = TrainingDatabaseBenefeciaryFormSchema.safeParse(formData);
      if (!result.success) {
        const errors: { [key: string]: string } = {};
        result.error.issues.forEach((issue) => {
          const field = issue.path.join(".");
          if (field && !errors[field]) {
            errors[field] = issue.message;
          }
        });
        setFormErrors(errors);
        reqForToastAndSetMessage(
          "Please fix validation errors before submitting.",
          "warning"
        );
        return;
      }
      setFormErrors({});
      setLoading(true);
      try {
        const url = IsEditMode(mode)
          ? `/training_db/beneficiary/${editId}`
          : "/training_db/beneficiary";
        const response = IsEditMode(mode)
          ? await requestHandler().put(url, formData)
          : await requestHandler().post(url, formData);
        reqForToastAndSetMessage(response.data.message, "success");
        handleReload();
        onOpenChange(false);
      } catch (error: any) {
        reqForToastAndSetMessage(
          error.response?.data?.message ||
            "Something went wrong while saving the beneficiary.",
          "error"
        );
      } finally {
        setLoading(false);
      }
    };
  /* ------------------------------------------------------------------------ */ /* Loading UI */ /* ------------------------------------------------------------------------ */ if (
    loading &&
    IsEditMode(mode)
  ) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        {" "}
        <DialogContent className=" min-w-4xl w-[92vw] max-h-[85vh] flex flex-col p-6 bg-card border border-border text-card-foreground shadow-2xl rounded-lg overflow-hidden ">
          {" "}
          <div className="flex flex-col items-center justify-center py-12 gap-3">
            {" "}
            <Loader2 className="h-6 w-6 animate-spin text-primary" />{" "}
            <p className="text-xs text-muted-foreground">
              {" "}
              Loading beneficiary data...{" "}
            </p>{" "}
          </div>{" "}
        </DialogContent>{" "}
      </Dialog>
    );
  }
  /* ------------------------------------------------------------------------ */ /* Render */ /* ------------------------------------------------------------------------ */ return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {" "}
      <DialogContent className=" min-w-4xl w-[92vw] max-h-[85vh] flex flex-col p-6 bg-card border border-border text-card-foreground shadow-2xl rounded-lg overflow-hidden animate-in fade-in zoom-in-95 duration-200 ">
        {" "}
        {/* ------------------------------------------------------------------ */}{" "}
        {/* Header */}{" "}
        {/* ------------------------------------------------------------------ */}{" "}
        <DialogHeader className="border-b border-border pb-3">
          {" "}
          <DialogTitle className="text-base font-bold text-foreground flex items-center gap-2">
            {" "}
            <UserRound className="h-5 w-5 text-primary" /> {title}{" "}
          </DialogTitle>{" "}
        </DialogHeader>{" "}
        {/* ------------------------------------------------------------------ */}{" "}
        {/* Body */}{" "}
        {/* ------------------------------------------------------------------ */}{" "}
        <div className=" flex-1 overflow-y-auto pr-1 space-y-6 py-4 scrollbar-thin scrollbar-thumb-border ">
          {" "}
          <form
            onSubmit={(e) => {
              e.preventDefault();
            }}
            className="space-y-6"
          >
            {" "}
            {/* -------------------------------------------------------------- */}{" "}
            {/* Beneficiary Information */}{" "}
            {/* -------------------------------------------------------------- */}{" "}
            <section className="rounded-lg border border-border/80 p-4 bg-muted/20 space-y-4">
              {" "}
              <div className="text-xs font-bold uppercase tracking-wider text-primary flex items-center gap-2">
                {" "}
                <UserRound className="h-4 w-4" /> Beneficiary Information{" "}
              </div>{" "}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {" "}
                {/* ---------------------------------------------------------- */}{" "}
                {/* Client Name */}{" "}
                {/* ---------------------------------------------------------- */}{" "}
                <div className="flex flex-col gap-1.5">
                  {" "}
                  <Label
                    htmlFor="name"
                    className="text-xs font-semibold text-muted-foreground"
                  >
                    {" "}
                    Client Name{" "}
                  </Label>{" "}
                  <Input
                    id="name"
                    name="name"
                    placeholder="Enter client name"
                    value={formData.name}
                    onChange={handleFormChange}
                    className={` bg-background border-input text-foreground focus-visible:ring-ring h-10 rounded-md text-xs transition-colors ${
                      formErrors.name
                        ? "border-destructive focus-visible:ring-destructive"
                        : ""
                    } `}
                  />{" "}
                  <FieldError message={formErrors.name} />{" "}
                </div>{" "}
                {/* ---------------------------------------------------------- */}{" "}
                {/* Father / Husband Name */}{" "}
                {/* ---------------------------------------------------------- */}{" "}
                <div className="flex flex-col gap-1.5">
                  {" "}
                  <Label
                    htmlFor="fatherHusbandName"
                    className="text-xs font-semibold text-muted-foreground"
                  >
                    {" "}
                    Father / Husband Name{" "}
                  </Label>{" "}
                  <Input
                    id="fatherHusbandName"
                    name="fatherHusbandName"
                    placeholder="Enter father / husband name"
                    value={formData.fatherHusbandName}
                    onChange={handleFormChange}
                    className={` bg-background border-input text-foreground focus-visible:ring-ring h-10 rounded-md text-xs transition-colors ${
                      formErrors.fatherHusbandName
                        ? "border-destructive focus-visible:ring-destructive"
                        : ""
                    } `}
                  />{" "}
                  <FieldError message={formErrors.fatherHusbandName} />{" "}
                </div>{" "}
                {/* ---------------------------------------------------------- */}{" "}
                {/* Gender */}{" "}
                {/* ---------------------------------------------------------- */}{" "}
                <div className="flex flex-col gap-1.5">
                  {" "}
                  <Label
                    htmlFor="gender"
                    className="text-xs font-semibold text-muted-foreground"
                  >
                    {" "}
                    Gender{" "}
                  </Label>{" "}
                  <SingleSelect
                    options={GenderOptions}
                    value={formData.gender}
                    onValueChange={handleGenderChange}
                    error={formErrors.gender}
                  />{" "}
                  <FieldError message={formErrors.gender} />{" "}
                </div>{" "}
                {/* ---------------------------------------------------------- */}{" "}
                {/* Age */}{" "}
                {/* ---------------------------------------------------------- */}{" "}
                <div className="flex flex-col gap-1.5">
                  {" "}
                  <Label
                    htmlFor="age"
                    className="text-xs font-semibold text-muted-foreground"
                  >
                    {" "}
                    Age{" "}
                  </Label>{" "}
                  <Input
                    id="age"
                    name="age"
                    type="number"
                    min={1}
                    placeholder="Enter age"
                    value={formData.age}
                    onChange={handleFormChange}
                    className={` bg-background border-input text-foreground focus-visible:ring-ring h-10 rounded-md text-xs transition-colors ${
                      formErrors.age
                        ? "border-destructive focus-visible:ring-destructive"
                        : ""
                    } `}
                  />{" "}
                  <FieldError message={formErrors.age} />{" "}
                </div>{" "}
                {/* ---------------------------------------------------------- */}{" "}
                {/* Phone */}{" "}
                {/* ---------------------------------------------------------- */}{" "}
                <div className="flex flex-col gap-1.5">
                  {" "}
                  <Label
                    htmlFor="phone"
                    className="text-xs font-semibold text-muted-foreground"
                  >
                    {" "}
                    Phone{" "}
                  </Label>{" "}
                  <Input
                    id="phone"
                    name="phone"
                    type="tel"
                    inputMode="numeric"
                    placeholder="Enter phone number"
                    value={formData.phone}
                    onChange={handleFormChange}
                    className={` bg-background border-input text-foreground focus-visible:ring-ring h-10 rounded-md text-xs transition-colors ${
                      formErrors.phone
                        ? "border-destructive focus-visible:ring-destructive"
                        : ""
                    } `}
                  />{" "}
                  <FieldError message={formErrors.phone} />{" "}
                </div>{" "}
                {/* ---------------------------------------------------------- */}{" "}
                {/* Beneficiary Code */}{" "}
                {/* ---------------------------------------------------------- */}{" "}
                <div className="flex flex-col gap-1.5">
                  {" "}
                  <Label
                    htmlFor="code"
                    className="text-xs font-semibold text-muted-foreground"
                  >
                    {" "}
                    Beneficiary Code{" "}
                  </Label>{" "}
                  <Input
                    id="code"
                    name="code"
                    placeholder="Enter beneficiary code"
                    value={formData.code}
                    onChange={handleFormChange}
                    className={` bg-background border-input text-foreground focus-visible:ring-ring h-10 rounded-md text-xs transition-colors ${
                      formErrors.code
                        ? "border-destructive focus-visible:ring-destructive"
                        : ""
                    } `}
                  />{" "}
                  <FieldError message={formErrors.code} />{" "}
                </div>{" "}
                {/* ---------------------------------------------------------- */}{" "}
                {/* Email */}{" "}
                {/* ---------------------------------------------------------- */}{" "}
                <div className="flex flex-col gap-1.5">
                  {" "}
                  <Label
                    htmlFor="email"
                    className="text-xs font-semibold text-muted-foreground"
                  >
                    {" "}
                    Email{" "}
                  </Label>{" "}
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="Enter email address"
                    value={formData.email}
                    onChange={handleFormChange}
                    className={` bg-background border-input text-foreground focus-visible:ring-ring h-10 rounded-md text-xs transition-colors ${
                      formErrors.email
                        ? "border-destructive focus-visible:ring-destructive"
                        : ""
                    } `}
                  />{" "}
                  <FieldError message={formErrors.email} />{" "}
                </div>{" "}
                {/* ---------------------------------------------------------- */}{" "}
                {/* Participant Organization */}{" "}
                {/* ---------------------------------------------------------- */}{" "}
                <div className="flex flex-col gap-1.5">
                  {" "}
                  <Label
                    htmlFor="participantOrganization"
                    className="text-xs font-semibold text-muted-foreground"
                  >
                    {" "}
                    Participant Organization{" "}
                  </Label>{" "}
                  <Input
                    id="participantOrganization"
                    name="participantOrganization"
                    placeholder="Enter participant organization"
                    value={formData.participantOrganization}
                    onChange={handleFormChange}
                    className={` bg-background border-input text-foreground focus-visible:ring-ring h-10 rounded-md text-xs transition-colors ${
                      formErrors.participantOrganization
                        ? "border-destructive focus-visible:ring-destructive"
                        : ""
                    } `}
                  />{" "}
                  <FieldError message={formErrors.participantOrganization} />{" "}
                </div>{" "}
                {/* ---------------------------------------------------------- */}{" "}
                {/* Job Title */}{" "}
                {/* ---------------------------------------------------------- */}{" "}
                <div className="flex flex-col gap-1.5">
                  {" "}
                  <Label
                    htmlFor="jobTitle"
                    className="text-xs font-semibold text-muted-foreground"
                  >
                    {" "}
                    Job Title{" "}
                  </Label>{" "}
                  <Input
                    id="jobTitle"
                    name="jobTitle"
                    placeholder="Enter job title"
                    value={formData.jobTitle}
                    onChange={handleFormChange}
                    className={` bg-background border-input text-foreground focus-visible:ring-ring h-10 rounded-md text-xs transition-colors ${
                      formErrors.jobTitle
                        ? "border-destructive focus-visible:ring-destructive"
                        : ""
                    } `}
                  />{" "}
                  <FieldError message={formErrors.jobTitle} />{" "}
                </div>{" "}
                {/* ---------------------------------------------------------- */}{" "}
                {/* Date of Registration */}{" "}
                {/* ---------------------------------------------------------- */}{" "}
                <div className="flex flex-col gap-1.5">
                  {" "}
                  <Label
                    htmlFor="dateOfRegistration"
                    className="text-xs font-semibold text-muted-foreground"
                  >
                    {" "}
                    Date of Registration{" "}
                  </Label>{" "}
                  <Input
                    id="dateOfRegistration"
                    name="dateOfRegistration"
                    type="date"
                    value={formData.dateOfRegistration}
                    onChange={handleFormChange}
                    className={` bg-background border-input text-foreground focus-visible:ring-ring h-10 rounded-md text-xs transition-colors ${
                      formErrors.dateOfRegistration
                        ? "border-destructive focus-visible:ring-destructive"
                        : ""
                    } `}
                  />{" "}
                  <FieldError message={formErrors.dateOfRegistration} />{" "}
                </div>{" "}
              </div>{" "}
            </section>{" "}
            {/* -------------------------------------------------------------- */}{" "}
            {/* Footer */}{" "}
            {/* -------------------------------------------------------------- */}{" "}
            <div className="flex justify-end gap-3 pt-4 border-t border-border mt-auto">
              {" "}
              <Button
                type="button"
                variant="outline"
                disabled={loading}
                className=" h-10 px-5 text-xs bg-secondary text-secondary-foreground hover:bg-secondary/80 "
                onClick={() => onOpenChange(false)}
              >
                {" "}
                Cancel{" "}
              </Button>{" "}
              <Button
                id={SUBMIT_BUTTON_PROVIDER_ID}
                type="button"
                disabled={loading}
                className=" h-10 px-6 text-xs bg-primary text-primary-foreground hover:bg-primary/90 "
                onClick={() =>
                  reqForConfirmationModelFunc(
                    TrainingBeneficiaryCreationMessage,
                    () => handleSubmit()
                  )
                }
              >
                {" "}
                {loading ? (
                  <>
                    {" "}
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />{" "}
                    {IsEditMode(mode) ? "Updating..." : "Saving..."}{" "}
                  </>
                ) : IsEditMode(mode) ? (
                  "Update Beneficiary"
                ) : (
                  "Create Beneficiary"
                )}{" "}
              </Button>{" "}
            </div>{" "}
          </form>{" "}
        </div>{" "}
      </DialogContent>{" "}
    </Dialog>
  );
};
export default TrainingBeneficiaryForm;
