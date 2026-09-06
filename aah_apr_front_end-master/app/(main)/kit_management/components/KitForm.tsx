"use client";

import { useParentContext } from "@/contexts/ParentContext";
import { useEffect, useState } from "react";
import { KitType } from "@/types/Types";
import { withPermission } from "@/lib/withPermission";
import { KitFormDefault } from "@/constants/FormsDefaultValues";

import {
  KitCreationMessage,
  KitEditionMessage,
} from "@/constants/ConfirmationModelsTexts";

import { KitStatusOptions } from "@/constants/SingleAndMultiSelectOptionsList";

import { KitFormInterface } from "@/interfaces/Interfaces";

import {
  IsCreateMode,
  IsEditMode,
  IsEditOrShowMode,
  IsNotShowMode,
  IsShowMode,
} from "@/constants/Constants";

import { AxiosError, AxiosResponse } from "axios";

import { SUBMIT_BUTTON_PROVIDER_ID } from "@/config/System";

import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";

import { Label } from "@/components/ui/label";

import { SingleSelect } from "@/components/single-select";

import { Input } from "@/components/ui/input";

import { Textarea } from "@/components/ui/textarea";

import { Button } from "@/components/ui/button";

import { KiteFormSchema } from "@/schemas/FormsSchema";

import { Info } from "lucide-react";

import { cn } from "@/lib/utils";

let mode: "create" | "edit" | "show" = "create";

const KitForm: React.FC<KitFormInterface> = ({
  open,
  onOpenChange,
  mode: formMode,
  kitId,
}) => {
  const {
    reqForToastAndSetMessage,
    axiosInstance,
    handleReload,
    reqForConfirmationModelFunc,
  } = useParentContext();

  const [formData, setFormData] = useState<KitType>(KitFormDefault());

  const [isLoading, setIsLoading] = useState<boolean>(false);

  const [formErrors, setFormErrors] = useState<{
    [key: string]: string;
  }>({});

  /**
   * =========================================================
   * Handle Form Change
   * =========================================================
   */
  const handleFormChange = (
    e:
      | React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
      | {
          target: {
            name: string;
            value: string;
          };
        }
  ) => {
    const name = e.target.name;
    const value = e.target.value;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    /**
     * Remove validation error when user changes the field
     */
    if (formErrors[name]) {
      setFormErrors((prev) => {
        const nextErrors = { ...prev };

        delete nextErrors[name];

        return nextErrors;
      });
    }
  };

  /**
   * =========================================================
   * Validate Form
   * =========================================================
   */
  const validateForm = () => {
    const result = KiteFormSchema.safeParse({
      name: formData.name,
      status: formData.status,
      description: formData.description,
    });

    if (!result.success) {
      const errors: {
        [key: string]: string;
      } = {};

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

      return false;
    }

    setFormErrors({});

    return true;
  };

  /**
   * =========================================================
   * Handle Submit
   * =========================================================
   */
  const handleSubmit = () => {
    /**
     * Validate before sending request
     */
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    /**
     * =======================================================
     * Create
     * =======================================================
     */
    if (IsCreateMode(formMode)) {
      axiosInstance
        .post("/kit_db/kit_mng/", formData)
        .then((response: AxiosResponse<any>) => {
          reqForToastAndSetMessage(response.data.message, "success");

          onOpenChange(false);

          handleReload();

          setFormData(KitFormDefault());

          setFormErrors({});
        })
        .catch((error: AxiosError<any>) => {
          reqForToastAndSetMessage(
            error.response?.data?.message ||
              "An error occurred while creating the kit.",
            "error"
          );
        })
        .finally(() => {
          setIsLoading(false);
        });

      return;
    }

    /**
     * =======================================================
     * Edit
     * =======================================================
     */
    if (IsEditMode(formMode) && kitId) {
      axiosInstance
        .put(`/kit_db/kit_mng/${kitId}`, formData)
        .then((response: AxiosResponse<any>) => {
          reqForToastAndSetMessage(response.data.message, "success");

          onOpenChange(false);

          handleReload();

          setFormErrors({});
        })
        .catch((error: AxiosError<any>) => {
          reqForToastAndSetMessage(
            error.response?.data?.message ||
              "An error occurred while updating the kit.",
            "error"
          );
        })
        .finally(() => {
          setIsLoading(false);
        });
    }
  };

  /**
   * =========================================================
   * Load Kit Data For Edit / Show
   * =========================================================
   */
  useEffect(() => {
    if (!open) return;

    /**
     * Reset form when opening Create mode
     */
    if (IsCreateMode(formMode)) {
      setFormData(KitFormDefault());

      setFormErrors({});

      return;
    }

    /**
     * Load data for Edit / Show
     */
    if (IsEditOrShowMode(formMode) && kitId) {
      setIsLoading(true);

      axiosInstance
        .get(`/kit_db/kit_mng/${kitId}`)
        .then((response: AxiosResponse<any>) => {
          setFormData(response.data.data);

          setFormErrors({});
        })
        .catch((error: AxiosError<any>) => {
          reqForToastAndSetMessage(
            error.response?.data?.message || "Unable to load kit information.",
            "error"
          );
        })
        .finally(() => {
          setIsLoading(false);
        });
    }
  }, [formMode, kitId, open]);

  /**
   * =========================================================
   * Read Only
   * =========================================================
   */
  const readOnly = IsShowMode(formMode);

  /**
   * =========================================================
   * Field Error Component
   * =========================================================
   */
  const FieldError = ({ field }: { field: string }) => {
    if (!formErrors[field]) {
      return null;
    }

    return (
      <span className="text-[10px] font-medium text-destructive flex items-center gap-1 mt-0.5 animate-in fade-in">
        <Info className="h-3 w-3 shrink-0" />

        {formErrors[field]}
      </span>
    );
  };

  /**
   * =========================================================
   * Input Class
   * =========================================================
   */
  const inputClass = (field: string) =>
    cn(
      "border-input",
      "focus-visible:ring-ring",
      "transition-colors",
      formErrors[field] && "border-destructive focus-visible:ring-destructive"
    );

  /**
   * =========================================================
   * Confirm Submit
   * =========================================================
   */
  const handleConfirmSubmit = () => {
    /**
     * Validate FIRST
     *
     * Confirmation dialog should only open when validation passes.
     */
    if (!validateForm()) {
      return;
    }

    reqForConfirmationModelFunc(
      IsCreateMode(formMode) ? KitCreationMessage : KitEditionMessage,
      handleSubmit
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex flex-col h-[50%] w-[70%]">
        {/* ===================================================
            Title
        ==================================================== */}
        <DialogTitle>
          {IsCreateMode(formMode) && "Add New Kit"}

          {IsEditMode(formMode) && "Edit Beneficiary Kit"}

          {IsShowMode(formMode) && "Beneficiary Kit"}
        </DialogTitle>

        {/* ===================================================
            Form
        ==================================================== */}
        <form
          className="space-y-4 grid grid-cols-2 gap-4"
          onSubmit={(e) => e.preventDefault()}
        >
          {/* =================================================
              Name
          ================================================== */}
          <div className="flex flex-col gap-2">
            <Label htmlFor="name">Name</Label>

            <Input
              id="name"
              name="name"
              value={formData.name ?? ""}
              onChange={handleFormChange}
              disabled={readOnly || isLoading}
              className={inputClass("name")}
            />

            <FieldError field="name" />
          </div>

          {/* =================================================
              Status
          ================================================== */}
          <div className="flex flex-col gap-2">
            <Label>Status</Label>

            <SingleSelect
              options={KitStatusOptions}
              value={formData.status ?? ""}
              onValueChange={(value: string) => {
                handleFormChange({
                  target: {
                    name: "status",
                    value,
                  },
                });
              }}
              disabled={readOnly || isLoading}
            />

            <FieldError field="status" />
          </div>

          {/* =================================================
              Description
          ================================================== */}
          <div className="flex flex-col gap-2">
            <Label htmlFor="description">Description</Label>

            <Textarea
              id="description"
              name="description"
              value={formData.description ?? ""}
              onChange={handleFormChange}
              disabled={readOnly || isLoading}
              rows={3}
              className={cn(
                inputClass("description"),
                formErrors.description &&
                  "border-destructive focus-visible:ring-destructive"
              )}
            />

            <FieldError field="description" />
          </div>

          {/* =================================================
              Submit
          ================================================== */}
          {IsNotShowMode(formMode) && (
            <div className="flex justify-end col-span-2">
              <Button
                id={SUBMIT_BUTTON_PROVIDER_ID}
                disabled={isLoading}
                type="button"
                onClick={handleConfirmSubmit}
              >
                {isLoading
                  ? IsCreateMode(formMode)
                    ? "Saving ..."
                    : "Updating ..."
                  : IsCreateMode(formMode)
                  ? "Save"
                  : "Update"}
              </Button>
            </div>
          )}

          {/* =================================================
              Close Button For Show Mode
          ================================================== */}
          {IsShowMode(formMode) && (
            <div className="flex justify-end col-span-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                Close
              </Button>
            </div>
          )}
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default withPermission(
  KitForm,
  IsCreateMode(mode) ? "Kit.create" : IsEditMode(mode) ? "Kit.edit" : "Kit.view"
);
