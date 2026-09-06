import React, { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
import { Label } from "../ui/label";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { useParentContext } from "@/contexts/ParentContext";
import { useProjectContext } from "@/app/(main)/projects/create_new_project/page";
import { useProjectEditContext } from "@/app/(main)/projects/edit_project/[id]/page";
import { useProjectShowContext } from "@/app/(main)/projects/project_show/[id]/page";
import { OutcomeFormSchema } from "@/schemas/FormsSchema";
import {
  CancelButtonMessage,
  OutcomeCreationMessage,
  OutcomeEditionMessage,
} from "@/constants/ConfirmationModelsTexts";
import { Outcome } from "@/app/(main)/projects/types/Types";
import { OutcomeDefault } from "@/constants/FormsDefaultValues";
import { OutcomeInterface } from "@/interfaces/Interfaces";
import {
  IsCreateMode,
  IsCreatePage,
  IsEditMode,
  IsEditOrShowMode,
  IsEditPage,
  IsNoOutcome,
  IsNotShowMode,
  IsOutcomeEdited,
  IsShowMode,
  IsThereAnyOutcomeWithEnteredReferance,
  IsThereAnyOutcomeWithEnteredReferanceAndDefferentId,
} from "@/constants/Constants";
import { Textarea } from "../ui/textarea";
import { SUBMIT_BUTTON_PROVIDER_ID } from "@/config/System";

const OutcomeModel: React.FC<OutcomeInterface> = ({
  isOpen,
  onOpenChange,
  outcomeId,
  mode,
  pageIdentifier,
}) => {
  const {
    reqForToastAndSetMessage,
    reqForConfirmationModelFunc,
    requestHandler,
  } = useParentContext();

  const {
    outcomes,
    setOutcomes,
    projectId,
  }: {
    projectId: number | null;
    outcomes: Outcome[];
    setOutcomes: React.Dispatch<React.SetStateAction<Outcome[]>>;
    setCurrentTab: (value: string) => void;
  } = IsCreatePage(pageIdentifier)
    ? useProjectContext()
    : IsEditPage(pageIdentifier)
      ? useProjectEditContext()
      : useProjectShowContext();

  const [formData, setFormData] = useState<Outcome>(OutcomeDefault());
  const [outcomeBeforeEdit, setOutcomeBeforeEdit] =
    useState<Outcome>(OutcomeDefault());
  const [formErrors, setFormErrors] = useState<{ [key: string]: string }>({});
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const handleFormChange = (e: any) => {
    const name: string = e.target.name;
    const value: string = e.target.value;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = () => {
    const result = OutcomeFormSchema.safeParse(formData);

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

    if (IsNoOutcome(formData)) {
      reqForToastAndSetMessage(
        "The outcome (or outcome referance) that you provided is a system reserved keyword please try something else !",
      );
      return;
    }

    if (
      IsCreateMode(mode) &&
      IsThereAnyOutcomeWithEnteredReferance(outcomes, formData)
    ) {
      reqForToastAndSetMessage(
        "A project can not have two outcomes with same referance !",
        "success"
      );
      return;
    } else if (
      IsEditMode(mode) &&
      IsThereAnyOutcomeWithEnteredReferanceAndDefferentId(outcomes, formData)
    ) {
      reqForToastAndSetMessage(
        "A project can not have two outcomes with same referance !",
        "error"
      );
      return;
    }

    setIsLoading(true);

    if (IsCreateMode(mode)) {
      requestHandler()
        .post("/projects/o/outcome", {
          project_id: projectId,
          outcome: formData.outcome,
          outcomeRef: formData.outcomeRef,
        })
        .then((response: any) => {
          reqForToastAndSetMessage(response.data.message);
          setOutcomes((prev) => [...prev, response.data.data]);
          onOpenChange(false);
        })
        .catch((error: any) => {
          reqForToastAndSetMessage(error.response.data.message);
        })
        .finally(() => setIsLoading(false));
    } else if (IsEditMode(mode))
      requestHandler()
        .put(`projects/outcome/${outcomeId}`, {
          outcome: formData.outcome,
          outcomeRef: formData.outcomeRef,
        })
        .then((response: any) => {
          reqForToastAndSetMessage(response.data.message);
          setOutcomes((prev) =>
            prev.map((o) =>
              o.outcomeRef == formData.outcomeRef
                ? {
                    ...o,
                    outcome: formData.outcome,
                    outcomeRef: formData.outcomeRef,
                  }
                : o,
            ),
          );
          onOpenChange(false);
        })
        .catch((error: any) =>
          reqForToastAndSetMessage(error.response.data.message),
        )
        .finally(() => setIsLoading(false));
  };

  const handleCancel = () => {
    if (IsOutcomeEdited(outcomeBeforeEdit, formData)) {
      reqForConfirmationModelFunc(CancelButtonMessage, () =>
        onOpenChange(false),
      );

      return;
    }

    onOpenChange(false);
  };

  useEffect(() => {
    if (IsEditOrShowMode(mode) && outcomeId) {
      setIsLoading(true);
      requestHandler()
        .get(`/projects/outcome/${outcomeId}`)
        .then((response: any) => {
          setFormData(response.data.data);
          setOutcomeBeforeEdit(response.data.data);
        })
        .catch((error: any) =>
          reqForToastAndSetMessage(error.response.data.message),
        )
        .finally(() => setIsLoading(false));
    }
  }, []);

  return (
    <Dialog open={isOpen} onOpenChange={() => onOpenChange(false)}>
      <DialogContent
        className="
        w-[95vw]
        sm:w-full
        sm:max-w-3xl
        border
        border-gray-300
        dark:border-gray-600
        rounded-lg
        overflow-auto
        mx-auto
        sm:ml-16
        px-4
        sm:px-6
        py-3
      "
        style={{
          minHeight: "60vh",
          maxHeight: "60vh",
        }}
      >
        <DialogHeader>
          <DialogTitle className="text-base sm:text-lg">
            {IsCreateMode(mode)
              ? "Create New Outcome"
              : IsEditMode(mode)
                ? "Edit Outcome"
                : "Show Outcome"}
          </DialogTitle>
        </DialogHeader>

        <div className="grid gap-4 mt-2">
          <div className="flex flex-col gap-1">
            <Label htmlFor="outcome">Outcome</Label>
            <Textarea
              id="outcome"
              name="outcome"
              value={formData.outcome}
              onChange={handleFormChange}
              disabled={IsShowMode(mode)}
              className={`border p-2 rounded min-h-[90px] ${
                formErrors.outcome ? "!border-red-500" : ""
              }`}
              title={formErrors.projectCode}
            />
          </div>

          <div className="flex flex-col gap-1">
            <Label htmlFor="outcomeRef">Outcome Reference</Label>
            <Input
              id="outcomeRef"
              name="outcomeRef"
              value={formData.outcomeRef}
              onChange={handleFormChange}
              disabled={IsShowMode(mode)}
              className={`border p-2 rounded ${
                formErrors.outcomeRef ? "!border-red-500" : ""
              }`}
              title={formErrors.projectCode}
            />
          </div>
        </div>

        {IsNotShowMode(mode) && (
          <DialogFooter className="mt-4">
            <div
              className="
              flex
              flex-col
              sm:flex-row
              gap-2
              w-full
              justify-end
            "
            >
              <Button
                variant="outline"
                className="w-full sm:w-auto"
                onClick={handleCancel}
              >
                Cancel
              </Button>
              <Button
                id={SUBMIT_BUTTON_PROVIDER_ID}
                disabled={isLoading}
                className="w-full sm:w-auto"
                onClick={() =>
                  reqForConfirmationModelFunc(
                    IsCreateMode(mode)
                      ? OutcomeCreationMessage
                      : OutcomeEditionMessage,
                    handleSubmit,
                  )
                }
              >
                {isLoading ? "Saving ..." : "Save"}
              </Button>
            </div>
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default OutcomeModel;
