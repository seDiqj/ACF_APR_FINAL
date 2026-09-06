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

const RefferalIndicatorSelector: React.FC<TrainingSelectorInterface> = ({
  open,
  onOpenChange,
  ids,
}) => {
  const {
    reqForToastAndSetMessage,
    requestHandler,
    reqForConfirmationModelFunc,
  } = useParentContext();

  const [indicators, setIndicators] = useState<
    { id: string; indicatorRef: string }[]
  >([]);

  const [selectedIndicator, setSelectedIndicator] = useState<string>("");

  const [isLoading, setIsLoading] = useState<boolean>(false);

  const handleSubmit = () => {
    if (!selectedIndicator) {
      reqForToastAndSetMessage("Please select a valid indicator at first !", "warning");
      return;
    }

    setIsLoading(true);

    requestHandler()
      .post("/referral_db/reffer_beneficiaries/", {
        selectedIndicator: selectedIndicator,
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
      .get("/referral_db/indicators/")
      .then((response: any) => {
        setIndicators(response.data.data);
      })
      .catch((error: any) =>
        reqForToastAndSetMessage(error.response.data.message, "error"),
      );
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
          <DialogTitle className="text-lg">Select Indicator</DialogTitle>
        </DialogHeader>

        <SingleSelect
          options={indicators.map((training) => ({
            value: training.id,
            label: training.indicatorRef.toUpperCase(),
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

export default RefferalIndicatorSelector;
