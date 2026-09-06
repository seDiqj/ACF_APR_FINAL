"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { SingleSelect } from "@/components/single-select";
import { Button } from "../ui/button";
import { useEffect, useState } from "react";
import { useParentContext } from "@/contexts/ParentContext";
import { TrainingSelectorInterface } from "@/interfaces/Interfaces";
import { TrainingSelectorMessage } from "@/constants/ConfirmationModelsTexts";
import { IsNotANullOrUndefinedValue } from "@/constants/Constants";
import { SUBMIT_BUTTON_PROVIDER_ID } from "@/config/System";

const TrainingSelectorDialog: React.FC<TrainingSelectorInterface> = ({
  open,
  onOpenChange,
  ids,
  trainingsData,
}) => {
  const {
    reqForToastAndSetMessage,
    requestHandler,
    reqForConfirmationModelFunc,
  } = useParentContext();

  const [trainings, setTrainings] = useState<{ id: string, name: string }[]>([]);

  const [selectedTraining, setSelectedTraining] = useState<string>("");

  const [isLoading, setIsLoading] = useState<boolean>(false);

  const handleSubmit = () => {
    if (!selectedTraining) return;

    setIsLoading(true);

    requestHandler()
      .post("/training_db/beneficiaries/add_training", {
        training: selectedTraining,
        ids: ids,
      })
      .then((response: any) => {
        reqForToastAndSetMessage(response.data.message, "success");
        onOpenChange(false);
      })
      .catch((error: any) =>
        reqForToastAndSetMessage(error.response.data.message, "error"),
      )
      .finally(() => setIsLoading(false));
  };

  useEffect(() => {
    requestHandler()
      .get("/training_db/trainings/for_selection")
      .then((response: any) => {
        setTrainings(response.data.data);
      })
      .catch((error: any) =>
        reqForToastAndSetMessage(error.response.data.message, "error"),
      );

    if (IsNotANullOrUndefinedValue(trainingsData))
      setSelectedTraining(trainingsData!);
  }, [open]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="sm:max-w-4xl border border-gray-300 dark:border-gray-600 rounded-lg ml-16 overflow-y-auto"
        style={{
          maxHeight: "85vh",
          paddingTop: "10px",
          paddingBottom: "10px",
          paddingLeft: "16px",
          paddingRight: "16px",
        }}
      >
        <DialogHeader>
          <DialogTitle className="text-lg">Select Training</DialogTitle>
        </DialogHeader>

        <SingleSelect
          options={trainings.map((training) => ({
            value: training.id,
            label: training.name.toUpperCase(),
          }))}
          value={selectedTraining}
          onValueChange={(value: string) => setSelectedTraining(value)}
        />

        {/* Submit Button */}
        <Button
          id={SUBMIT_BUTTON_PROVIDER_ID}
          disabled={isLoading}
          onClick={() =>
            reqForConfirmationModelFunc(TrainingSelectorMessage, () =>
              handleSubmit(),
            )
          }
          className="w-full mt-6"
        >
          {isLoading ? "Saving ..." : "Save"}
        </Button>
      </DialogContent>
    </Dialog>
  );
};

export default TrainingSelectorDialog;
