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
import { SUBMIT_BUTTON_PROVIDER_ID } from "@/config/System";
import { Label } from "../ui/label";

const ProgramAndIndicatorSelector: React.FC<TrainingSelectorInterface> = ({
  open,
  onOpenChange,
  ids,
}) => {
  const {
    reqForToastAndSetMessage,
    requestHandler,
    reqForConfirmationModelFunc,
  } = useParentContext();

  const [programs, setPrograms] = useState<{ id: string; name: string }[]>([]);
  const [indicators, setIndicators] = useState<
    { id: string; indicatorRef: string }[]
  >([]);

  const [selectedProgram, setSelectedProgram] = useState<string>("");
  const [selectedIndicator, setSelectedIndicator] = useState<string>("");

  const [isLoading, setIsLoading] = useState<boolean>(false);

  const handleSubmit = () => {
    if (!selectedProgram) {
      reqForToastAndSetMessage("Please select a valid program at first !", "warning");
      return;
    }

    setIsLoading(true);

    requestHandler()
      .post("/main_db/beneficiary/add_to_kit_list/", {
        program: selectedProgram,
        indicator: selectedIndicator,
        ids: Object.keys(ids),
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
      .get(`global/programs_for_selection/kit_database`)
      .then((response: any) => {
        setPrograms(response.data.data.data);
      })
      .catch((error: any) =>
        reqForToastAndSetMessage(error.response.data.message, "error"),
      );
  }, [open]);

  useEffect(() => {
    if (!selectedProgram) return;
    requestHandler()
      .get(`/global/indicators/${selectedProgram}/kit_database`)
      .then((response: any) => {
        setIndicators(response.data.data);
      })
      .catch((error: any) =>
        reqForToastAndSetMessage(error.response.data.message, "error"),
      );
  }, [selectedProgram]);

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
          <DialogTitle className="text-lg">
            Select Program & Indicator
          </DialogTitle>
        </DialogHeader>

        <Label>Select Program</Label>
        <SingleSelect
          options={programs.map((program) => ({
            value: program.id,
            label: program.name.toUpperCase(),
          }))}
          value={selectedProgram}
          onValueChange={(value: string) => setSelectedProgram(value)}
        />

        <Label>Select Indicator</Label>
        <SingleSelect
          options={indicators.map((indicator) => ({
            value: indicator.id,
            label: indicator.indicatorRef.toUpperCase(),
          }))}
          value={selectedIndicator}
          onValueChange={(value: string) => setSelectedIndicator(value)}
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

export default ProgramAndIndicatorSelector;
