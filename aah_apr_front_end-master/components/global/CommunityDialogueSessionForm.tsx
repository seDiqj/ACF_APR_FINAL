"use client";

import * as React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useParentContext } from "@/contexts/ParentContext";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { CommunityDialogueSessionDefault } from "@/constants/FormsDefaultValues";
import { CommunityDialogueSessionForm } from "@/types/Types";
import { CommunityDialogueSessionSubmitMessage } from "@/constants/ConfirmationModelsTexts";
import {
  IsCreateMode,
  IsEditMode,
  IsNotShowMode,
  IsShowMode,
} from "@/constants/Constants";
import { CommunityDialogueSessionFormInterface } from "@/interfaces/Interfaces";
import { SUBMIT_BUTTON_PROVIDER_ID } from "@/config/System";

const SessionForm: React.FC<CommunityDialogueSessionFormInterface> = ({
  open,
  onOpenChange,
  sessionId,
  mode,
}) => {
  const { id } = useParams();

  const {
    reqForToastAndSetMessage,
    requestHandler,
    reqForConfirmationModelFunc,
    handleReload,
  } = useParentContext();

  const [formData, setFormData] = useState<CommunityDialogueSessionForm>(
    CommunityDialogueSessionDefault(id as unknown as string),
  );

  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(false);

  const handleSubmit = () => {
    if (!formData.date || !formData.topic)
      return reqForToastAndSetMessage("Please fill all fields.", "warning");

    setLoading(true);

    const request = IsCreateMode(mode)
      ? requestHandler().post(
          "/community_dialogue_db/community_dialogue/session",
          formData,
        )
      : requestHandler().put(
          `/community_dialogue_db/community_dialogue/session/${sessionId}`,
          formData,
        );

    request
      .then((response: any) => {
        reqForToastAndSetMessage(response.data.message, "success");
        onOpenChange(false);
        handleReload();
      })
      .catch((error: any) =>
        reqForToastAndSetMessage(
          error.response?.data?.message || "Error occurred.",
          "error"
        ),
      )
      .finally(() => {
        setLoading(false);
      });
  };

  const handleFormChange = (e: any) => {
    const { id, value } = e.target;
    setFormData((prev) => ({ ...prev, [id]: value }));
  };

  useEffect(() => {
    if (IsEditMode(mode) || IsShowMode(mode)) {
      setFetching(true);
      requestHandler()
        .get(`/community_dialogue_db/community_dialogue/session/${sessionId}`)
        .then((response: any) => {
          setFormData(response.data.data);
        })
        .catch((error: any) =>
          reqForToastAndSetMessage(
            error.response?.data?.message || "Error fetching data.",
            "error"
          ),
        )
        .finally(() => setFetching(false));
    }
  }, [mode, sessionId]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>
            {IsCreateMode(mode)
              ? "Add New Session"
              : IsEditMode(mode)
                ? "Update Session"
                : "Session Information"}
          </DialogTitle>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          {/* Topic */}
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="topic" className="text-right">
              Topic
            </Label>
            {fetching ? (
              <Skeleton className="h-10 col-span-3 rounded-md" />
            ) : (
              <Input
                id="topic"
                value={formData.topic}
                onChange={handleFormChange}
                className="col-span-3"
                placeholder="Enter topic"
                disabled={mode === "show"}
              />
            )}
          </div>

          {/* Date */}
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="date" className="text-right">
              Date
            </Label>
            {fetching ? (
              <Skeleton className="h-10 col-span-3 rounded-md" />
            ) : (
              <Input
                id="date"
                type="date"
                value={formData.date}
                onChange={handleFormChange}
                className="col-span-3"
                disabled={mode === "show"}
              />
            )}
          </div>
        </div>

        {IsNotShowMode(mode) && !fetching && (
          <Button
            id={SUBMIT_BUTTON_PROVIDER_ID}
            onClick={() =>
              reqForConfirmationModelFunc(
                CommunityDialogueSessionSubmitMessage,
                () => handleSubmit(),
              )
            }
            disabled={loading}
          >
            {loading ? "Saving..." : IsCreateMode(mode) ? "Save" : "Update"}
          </Button>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default SessionForm;
