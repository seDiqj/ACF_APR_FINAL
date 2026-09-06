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
import {
  CancelButtonMessage,
  OutputCreationMessage,
  OutputEditionMessage,
} from "@/constants/ConfirmationModelsTexts";
import { useParentContext } from "@/contexts/ParentContext";
import { OutputDefault } from "@/constants/FormsDefaultValues";
import { Outcome, Output } from "@/app/(main)/projects/types/Types";
import { useProjectContext } from "@/app/(main)/projects/create_new_project/page";
import { useProjectEditContext } from "@/app/(main)/projects/edit_project/[id]/page";
import { useProjectShowContext } from "@/app/(main)/projects/project_show/[id]/page";
import { SingleSelect } from "../single-select";
import { OutputInterface } from "@/interfaces/Interfaces";
import {
  IsCreateMode,
  IsCreatePage,
  IsEditMode,
  IsEditPage,
  IsNoOutcome,
  IsNotShowMode,
  IsOutcomeSaved,
  IsOutputEdited,
  IsShowMode,
  IsThereAnyOutputWithEnteredReferance,
  IsThereAnyOutputWithEnteredReferanceAndDefferentId,
} from "@/constants/Constants";
import { OutputFormSchema } from "@/schemas/FormsSchema";
import { Textarea } from "../ui/textarea";
import { SUBMIT_BUTTON_PROVIDER_ID } from "@/config/System";

const OutputModel: React.FC<OutputInterface> = ({
  isOpen,
  onOpenChange,
  mode,
  pageIdentifier,
  outputId,
}) => {
  const {
    reqForConfirmationModelFunc,
    reqForToastAndSetMessage,
    requestHandler,
  } = useParentContext();
  const {
    outcomes,
    outputs,
    setOutputs,
  }: {
    outcomes: Outcome[];
    outputs: Output[];
    setOutputs: React.Dispatch<React.SetStateAction<Output[]>>;
  } = IsCreatePage(pageIdentifier)
    ? useProjectContext()
    : IsEditPage(pageIdentifier)
      ? useProjectEditContext()
      : useProjectShowContext();

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [formData, setFormData] = useState<Output>(OutputDefault());
  const [outputBeforeEdit, setOutputBeforeEdite] =
    useState<Output>(OutputDefault());
  const [formErrors, setFormErrors] = useState<{ [key: string]: string }>({});

  const handleFormChange = (e: any) => {
    const name: string = e.target.name;
    const value: string = e.target.value;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = () => {
    const result = OutputFormSchema.safeParse(formData);

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

    if (
      IsCreateMode(mode) &&
      IsThereAnyOutputWithEnteredReferance(outputs, formData.outputRef)
    ) {
      reqForToastAndSetMessage(
        "A project can not have two output with same referance !",
      );
      return;
    } else if (
      IsEditMode(mode) &&
      IsThereAnyOutputWithEnteredReferanceAndDefferentId(outputs, formData)
    ) {
      reqForToastAndSetMessage(
        "A project can not have two output with same referance !",
      );
      return;
    }

    setIsLoading(true);

    if (IsCreateMode(mode))
      requestHandler()
        .post("/projects/o/output", formData)
        .then((response: any) => {
          reqForToastAndSetMessage(response.data.message, "success");
          setOutputs((prev) => [
            ...prev,
            { ...formData, id: response.data.data.id },
          ]);
          onOpenChange(false);
        })
        .catch((error: any) => {
          reqForToastAndSetMessage(error.response.data.message, "error");
        })
        .finally(() => setIsLoading(false));
    else if (IsEditMode(mode))
      requestHandler()
        .put(`/projects/output/${outputId}`, formData)
        .then((response: any) => {
          reqForToastAndSetMessage(response.data.message, "success");
          setOutputs((prev) =>
            prev.map((output) =>
              output.id == formData.id ? formData : output,
            ),
          );
          onOpenChange(false);
        })
        .catch((error: any) =>
          reqForToastAndSetMessage(error.response.data.message, "error"),
        )
        .finally(() => setIsLoading(false));
  };

  const handleCancel = () => {
    if (IsOutputEdited(outputBeforeEdit, formData)) {
      reqForConfirmationModelFunc(CancelButtonMessage, () =>
        onOpenChange(false),
      );

      return;
    }

    onOpenChange(false);
  };

  useEffect(() => {
    if ((IsEditMode(mode) || IsShowMode(mode)) && outputId) {
      setIsLoading(true);
      requestHandler()
        .get(`projects/output/${outputId}`)
        .then((response: any) => {
          setFormData(response.data.data);
          setOutputBeforeEdite(response.data.data);
        })
        .catch((error: any) =>
          reqForToastAndSetMessage(error.response.data.message, "error"),
        )
        .finally(() => setIsLoading(false));
    }
  }, []);

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
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
              ? "Create New Output"
              : IsEditMode(mode)
                ? "Edit Output"
                : "Show Output"}
          </DialogTitle>
        </DialogHeader>

        <div className="grid gap-4 mt-2">
          <div className="flex flex-col gap-1">
            <Label htmlFor="outputRef">Outcome Reference</Label>
            <SingleSelect
              options={outcomes
                .filter((outcome) => IsOutcomeSaved(outcome))
                .map((outcome) => {
                  let outcomeRef: string = outcome.outcomeRef;

                  if (IsNoOutcome(outcome)) outcomeRef = "No outcome";

                  return {
                    value: outcome.id!,
                    label: outcomeRef,
                  };
                })}
              value={formData.outcomeId ?? "Unknown value"}
              onValueChange={(value: string) =>
                setFormData((prev) => ({
                  ...prev,
                  outcomeId: value,
                }))
              }
              error={formErrors.outcomeId}
            />
          </div>

          <div className="flex flex-col gap-1">
            <Label htmlFor="output">Output</Label>
            <Textarea
              id="output"
              name="output"
              value={formData.output}
              onChange={handleFormChange}
              disabled={mode == "show"}
              className={`border p-2 rounded min-h-[90px] ${
                formErrors.output ? "!border-red-500" : ""
              }`}
              title={formErrors.output}
            />
          </div>

          <div className="flex flex-col gap-1">
            <Label htmlFor="outputRef">Output Reference</Label>
            <Input
              id="outputRef"
              name="outputRef"
              value={formData.outputRef}
              onChange={handleFormChange}
              disabled={mode == "show"}
              className={`border p-2 rounded ${
                formErrors.outputRef ? "!border-red-500" : ""
              }`}
              title={formErrors.outputRef}
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
                      ? OutputCreationMessage
                      : OutputEditionMessage,
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

export default OutputModel;
