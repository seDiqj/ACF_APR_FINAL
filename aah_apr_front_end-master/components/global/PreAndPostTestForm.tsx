"use client";

import * as React from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { useEffect, useState } from "react";
import { useParentContext } from "@/contexts/ParentContext";
import { useParams } from "next/navigation";
import { PreAndPostTestsDefault } from "@/constants/FormsDefaultValues";
import { PreAndPostTestFormType } from "@/types/Types";
import { PreAndPostTestCreationMessage } from "@/constants/ConfirmationModelsTexts";
import { PreAndPostTestsInterface } from "@/interfaces/Interfaces";
import { SUBMIT_BUTTON_PROVIDER_ID } from "@/config/System";

const PreAndPostTestForm: React.FC<PreAndPostTestsInterface> = ({
  open,
  onOpenChange,
  chapterId,
}) => {
  const { id } = useParams<{
    id: string;
  }>();

  const {
    reqForToastAndSetMessage,
    requestHandler,
    reqForConfirmationModelFunc,
  } = useParentContext();

  const [loading, setLoading] = useState<boolean>(false);

  const [formData, setFormData] = useState<PreAndPostTestFormType>(
    PreAndPostTestsDefault(),
  );

  const handleFormChange = (e: any) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (e: any) => {
    e.preventDefault();
    setLoading(true);
    requestHandler()
      .put(
        `training_db/beneficiary/chapter/setPreAndPostTest/${id}/${chapterId}`,
        formData,
      )
      .then((response: any) => {
        onOpenChange(false);
        reqForToastAndSetMessage(response.data.message, "success");
      })
      .catch((error: any) =>
        reqForToastAndSetMessage(error.response.data.message, "error"),
      )
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    requestHandler()
      .get(`/training_db/beneficiary/chapter/preAndPostTest/${id}/${chapterId}`)
      .then((response: any) => {
        setFormData(response.data.data);
      })
      .catch((error: any) =>
        reqForToastAndSetMessage(error.response.data.message, "error"),
      );
  }, []);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogTitle>Beneficiary Pre & Post</DialogTitle>

        <form className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex flex-col gap-2">
              <Label>Pre Test Score</Label>
              <Input
                type="text"
                name="preTestScore"
                value={formData.preTestScore}
                onChange={handleFormChange}
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label>Post Test Score</Label>
              <Input
                type="text"
                name="postTestScore"
                value={formData.postTestScore}
                onChange={handleFormChange}
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label>Remark</Label>
              <Textarea
                name="remark"
                value={formData.remark}
                onChange={handleFormChange}
                rows={3}
              />
            </div>
          </div>

          <div className="flex justify-end mt-4">
            <Button
              id={SUBMIT_BUTTON_PROVIDER_ID}
              disabled={loading}
              type="button"
              onClick={(e) =>
                reqForConfirmationModelFunc(PreAndPostTestCreationMessage, () =>
                  handleSubmit(e),
                )
              }
            >
              {loading ? "Saving..." : "Save"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default PreAndPostTestForm;
