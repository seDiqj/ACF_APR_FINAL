"use client";

import { useParentContext } from "@/contexts/ParentContext";
import { SingleSelect } from "../single-select";
import { Button } from "../ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
import { Input } from "../ui/input";
import { Textarea } from "../ui/textarea";
import { Label } from "../ui/label";
import { useEffect, useState } from "react";
import { KitFormType } from "@/types/Types";
import { useParams } from "next/navigation";
import { withPermission } from "@/lib/withPermission";
import { KitDefault } from "@/constants/FormsDefaultValues";
import {
  KitCreationMessage,
  KitEditionMessage,
} from "@/constants/ConfirmationModelsTexts";
import { KitRecievedOptions } from "@/constants/SingleAndMultiSelectOptionsList";
import { KitFormInterface } from "@/interfaces/Interfaces";
import {
  IsCreateMode,
  IsEditMode,
  IsEditOrShowMode,
  IsNotShowMode,
  IsSelectMode,
  IsShowMode,
} from "@/constants/Constants";
import { AxiosError, AxiosResponse } from "axios";
import { SUBMIT_BUTTON_PROVIDER_ID } from "@/config/System";
import { KitFormSchema } from "@/schemas/FormsSchema";
import {
  ClipboardList,
  Info,
  Package,
  Loader2,
  CalendarDays,
  MessageSquareText,
  CheckCircle2,
} from "lucide-react";

const KitForm: React.FC<KitFormInterface> = ({
  open,
  onOpenChange,
  mode,
  kitId,
  ids,
}) => {
  const { id } = useParams();

  const {
    reqForToastAndSetMessage,
    requestHandler,
    handleReload,
    reqForConfirmationModelFunc,
  } = useParentContext();

  const [formData, setFormData] = useState<KitFormType>(KitDefault());

  const [formErrors, setFormErrors] = useState<{
    [key: string]: string;
  }>({});

  const [isLoading, setIsLoading] = useState<boolean>(false);

  const [kits, setKits] = useState<{ id: string; name: string }[]>([]);

  const handleFormChange = (e: any) => {
    const name: string = e.target.name;
    const value = e.target.value;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Clear the validation error when the field is corrected
    if (formErrors[name]) {
      setFormErrors((prev) => {
        const next = { ...prev };
        delete next[name];
        return next;
      });
    }
  };

  const handleSubmit = (e: any) => {
    if (e?.preventDefault) {
      e.preventDefault();
    }

    const result = KitFormSchema.safeParse(formData);

    if (!result.success) {
      const errors: { [key: string]: string } = {};

      result.error.issues.forEach((issue) => {
        const field = issue.path[0];

        if (field) {
          errors[field as string] = issue.message;
        }
      });

      setFormErrors(errors);

      reqForToastAndSetMessage(
        "Please resolve the validation errors before submitting.",
        "warning",
      );

      return;
    }

    setFormErrors({});
    setIsLoading(true);

    if (IsCreateMode(mode)) {
      requestHandler()
        .post(`/kit_db/add_kit_to_bnf/${id}`, formData)
        .then((response: any) => {
          reqForToastAndSetMessage(response.data.message, "success");
          onOpenChange(false);
          handleReload();
        })
        .catch((error: any) =>
          reqForToastAndSetMessage(
            error.response?.data?.message || "An error occurred.",
            "error",
          ),
        )
        .finally(() => setIsLoading(false));
    } else if (IsEditMode(mode) && kitId) {
      requestHandler()
        .put(`/kit_db/kit/${kitId}`, formData)
        .then((response: any) => {
          reqForToastAndSetMessage(response.data.message, "success");
          onOpenChange(false);
          handleReload();
        })
        .catch((error: any) =>
          reqForToastAndSetMessage(
            error.response?.data?.message || "An error occurred.",
            "error",
          ),
        )
        .finally(() => setIsLoading(false));
    } else if (IsSelectMode(mode) && ids) {
      requestHandler()
        .post(`/kit_db/add_kit_to_bnfs`, {
          kitData: formData,
          beneficiaryIds: ids,
        })
        .then((response: any) => {
          reqForToastAndSetMessage(response.data.message, "success");
          onOpenChange(false);
        })
        .catch((error: any) =>
          reqForToastAndSetMessage(
            error.response?.data?.message || "An error occurred.",
            "error",
          ),
        )
        .finally(() => setIsLoading(false));
    }
  };

  useEffect(() => {
    if (IsEditOrShowMode(mode) && kitId && open) {
      requestHandler()
        .get(`/kit_db/show_kit/${kitId}`)
        .then((response: AxiosResponse<any, any, any>) => {
          setFormData(response.data.data);
          setFormErrors({});
        })
        .catch((error: AxiosError<any, any>) => {
          reqForToastAndSetMessage(
            error.response?.data?.message,
            "error",
          );
        });
    }

    requestHandler()
      .get("/kit_db/kit_list")
      .then((response: any) => {
        if (response.data.status) {
          setKits(response.data.data);
        }
      })
      .catch((error: any) =>
        reqForToastAndSetMessage(
          error.response?.data?.message,
          "error",
        ),
      );
  }, [mode, kitId, open]);

  const readOnly = IsShowMode(mode);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="
          min-w-4xl
          w-[92vw]
          max-h-[85vh]
          flex flex-col
          p-6
          bg-card
          border border-border
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
        {/* Header */}
        <DialogHeader className="border-b border-border pb-3">
          <DialogTitle className="text-base font-bold text-foreground flex items-center gap-2">
            <Package className="h-5 w-5 text-primary" />

            {IsCreateMode(mode) && "Add New Kit"}
            {IsEditMode(mode) && "Edit Beneficiary Kit"}
            {IsShowMode(mode) && "Beneficiary Kit"}
            {IsSelectMode(mode) && "Assign Kit"}
          </DialogTitle>
        </DialogHeader>

        {/* Body */}
        <div className="flex-1 overflow-y-auto pr-1 space-y-6 py-4 scrollbar-thin scrollbar-thumb-border">
          {/* Kit Information */}
          <div className="rounded-lg border border-border/80 p-4 bg-muted/20 space-y-4">
            <div className="text-xs font-bold uppercase tracking-wider text-primary flex items-center gap-2">
              <Package className="h-4 w-4" />
              Kit Information
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Kit */}
              <div className="flex flex-col gap-1.5">
                <Label className="text-xs font-semibold text-muted-foreground">
                  Select Kit
                </Label>

                <SingleSelect
                  options={kits.map((kit) => ({
                    value: kit.id,
                    label: kit.name.toUpperCase(),
                  }))}
                  value={formData.kitId}
                  onValueChange={(value: string) =>
                    handleFormChange({
                      target: {
                        name: "kitId",
                        value,
                      },
                    })
                  }
                  placeholder="Select Kit"
                  error={formErrors.kitId}
                  disabled={readOnly}
                />

                {formErrors.kitId && (
                  <span className="text-[10px] font-medium text-destructive flex items-center gap-1 mt-0.5">
                    <Info className="h-3 w-3" />
                    {formErrors.kitId}
                  </span>
                )}
              </div>

              {/* Distribution Date */}
              <div className="flex flex-col gap-1.5">
                <Label className="text-xs font-semibold text-muted-foreground">
                  Distribution Date
                </Label>

                <Input
                  type="date"
                  name="destribution_date"
                  value={formData.destribution_date}
                  onChange={handleFormChange}
                  disabled={readOnly}
                  className={`bg-background border-input text-foreground focus-visible:ring-ring h-10 rounded-md text-xs transition-colors ${
                    formErrors.destribution_date
                      ? "border-destructive focus-visible:ring-destructive"
                      : ""
                  }`}
                />

                {formErrors.destribution_date && (
                  <span className="text-[10px] font-medium text-destructive flex items-center gap-1 mt-0.5">
                    <Info className="h-3 w-3" />
                    {formErrors.destribution_date}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Distribution Details */}
          <div className="space-y-4">
            <div className="text-xs font-bold uppercase tracking-wider text-primary flex items-center gap-2 border-b border-border/60 pb-2">
              <ClipboardList className="h-4 w-4" />
              Distribution Details
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Is Received */}
              <div className="flex flex-col gap-1.5">
                <Label className="text-xs font-semibold text-muted-foreground">
                  Is Received
                </Label>

                <SingleSelect
                  options={KitRecievedOptions}
                  value={formData.is_received ? "true" : "false"}
                  onValueChange={(value: string) =>
                    handleFormChange({
                      target: {
                        name: "is_received",
                        value: value === "true",
                      },
                    })
                  }
                  disabled={readOnly}
                  error={formErrors.is_received}
                />

                {formErrors.is_received && (
                  <span className="text-[10px] font-medium text-destructive flex items-center gap-1 mt-0.5">
                    <Info className="h-3 w-3" />
                    {formErrors.is_received}
                  </span>
                )}
              </div>

              {/* Remark */}
              <div className="flex flex-col gap-1.5">
                <Label className="text-xs font-semibold text-muted-foreground">
                  Remark
                </Label>

                <Textarea
                  name="remark"
                  value={formData.remark}
                  onChange={handleFormChange}
                  disabled={readOnly}
                  rows={4}
                  className={`bg-background border-input text-foreground focus-visible:ring-ring rounded-md text-xs transition-colors resize-none ${
                    formErrors.remark
                      ? "border-destructive focus-visible:ring-destructive"
                      : ""
                  }`}
                />

                {formErrors.remark && (
                  <span className="text-[10px] font-medium text-destructive flex items-center gap-1 mt-0.5">
                    <Info className="h-3 w-3" />
                    {formErrors.remark}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        {IsNotShowMode(mode) && (
          <div className="flex justify-end gap-3 pt-4 border-t border-border mt-auto">
            <Button
              variant="outline"
              type="button"
              onClick={() => onOpenChange(false)}
              disabled={isLoading}
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
              disabled={isLoading}
              type="button"
              onClick={(e) =>
                reqForConfirmationModelFunc(
                  IsCreateMode(mode)
                    ? KitCreationMessage
                    : KitEditionMessage,
                  () => handleSubmit(e),
                )
              }
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
              {isLoading ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />

                  <span>
                    {IsCreateMode(mode) || IsSelectMode(mode)
                      ? "Saving..."
                      : "Updating..."}
                  </span>
                </>
              ) : (
                <>
                  {IsCreateMode(mode) ? (
                    <ClipboardList className="h-3.5 w-3.5" />
                  ) : (
                    <CheckCircle2 className="h-3.5 w-3.5" />
                  )}

                  <span>
                    {IsCreateMode(mode) ? "Save" : "Update"}
                  </span>
                </>
              )}
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default withPermission(KitForm, "Kit.assign");
