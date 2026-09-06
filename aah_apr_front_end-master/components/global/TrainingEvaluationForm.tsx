"use client";

import React, { useEffect, useState } from "react";
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { PlusCircle, Trash2 } from "lucide-react";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useParentContext } from "@/contexts/ParentContext";
import { useParams } from "next/navigation";
import { Evaluation } from "@/types/Types";
import { TrainingEvaluationInterface } from "@/interfaces/Interfaces";
import { EvaluationOptions } from "@/constants/SingleAndMultiSelectOptionsList";
import { TrainingEvaluationSubmitMessage } from "@/constants/ConfirmationModelsTexts";
import { SUBMIT_BUTTON_PROVIDER_ID } from "@/config/System";
import { Textarea } from "../ui/textarea";

const TrainingEvaluationForm: React.FC<TrainingEvaluationInterface> = ({
  previosTrainingEvaluations,
}) => {
  const { id } = useParams<{
    id: string;
  }>();

  const {
    reqForToastAndSetMessage,
    requestHandler,
    reqForConfirmationModelFunc,
  } = useParentContext();

  /**
   * ---------------------------------------------------------
   * State
   * ---------------------------------------------------------
   */

  const [evaluations, setEvaluations] = useState<Evaluation[]>([]);

  const [remark, setRemark] = useState<string>("");

  const [isLoading, setIsLoading] = useState<boolean>(false);

  /**
   * ---------------------------------------------------------
   * Load previous evaluation
   * ---------------------------------------------------------
   *
   * The previous version created one empty row first and then
   * appended previous rows to it. That caused one extra row.
   *
   * Here we directly replace the state with the previous data.
   */

  useEffect(() => {
    if (!previosTrainingEvaluations) {
      setEvaluations([
        {
          participant: "",
          selected: "",
        },
      ]);

      setRemark("");

      return;
    }

    const previousEvaluations = previosTrainingEvaluations.evaluations;

    if (Array.isArray(previousEvaluations) && previousEvaluations.length > 0) {
      setEvaluations(
        previousEvaluations.map((item: Evaluation) => ({
          participant: item.participant ?? "",
          selected: item.selected ?? "",
        }))
      );
    } else {
      setEvaluations([
        {
          participant: "",
          selected: "",
        },
      ]);
    }

    setRemark(previosTrainingEvaluations.remark ?? "");
  }, [previosTrainingEvaluations]);

  /**
   * ---------------------------------------------------------
   * Handle evaluation selection
   * ---------------------------------------------------------
   */

  const handleSelect = (index: number, value: string) => {
    setEvaluations((prev) =>
      prev.map((evalItem, i) =>
        i === index
          ? {
              ...evalItem,
              selected: value,
            }
          : evalItem
      )
    );
  };

  /**
   * ---------------------------------------------------------
   * Handle participant code
   * ---------------------------------------------------------
   */

  const handleParticipantCodeChange = (index: number, value: string) => {
    setEvaluations((prev) =>
      prev.map((evalItem, i) =>
        i === index
          ? {
              ...evalItem,
              participant: value,
            }
          : evalItem
      )
    );
  };

  /**
   * ---------------------------------------------------------
   * Add new evaluation row
   * ---------------------------------------------------------
   */

  const addEvaluation = () => {
    setEvaluations((prev) => [
      ...prev,
      {
        participant: "",
        selected: "",
      },
    ]);
  };

  /**
   * ---------------------------------------------------------
   * Remove evaluation row
   * ---------------------------------------------------------
   */

  const removeEvaluation = (index: number) => {
    setEvaluations((prev) => {
      const updated = prev.filter((_, i) => i !== index);

      /**
       * Keep one empty row if everything was removed.
       * This makes it easier for the user to continue entering
       * evaluations.
       */
      if (updated.length === 0) {
        return [
          {
            participant: "",
            selected: "",
          },
        ];
      }

      return updated;
    });
  };

  /**
   * ---------------------------------------------------------
   * Summary
   * ---------------------------------------------------------
   */

  const summary = evaluations.reduce(
    (acc, curr) => {
      if (curr.selected && curr.selected in acc) {
        acc[curr.selected as keyof typeof acc]++;
      }

      return acc;
    },
    {
      informative: 0,
      usefulness: 0,
      understanding: 0,
      relevance: 0,
      applicability: 0,
    }
  );

  /**
   * ---------------------------------------------------------
   * Total selected evaluations
   * ---------------------------------------------------------
   */

  const totalSelections = Object.values(summary).reduce(
    (sum, value) => sum + value,
    0
  );

  /**
   * ---------------------------------------------------------
   * Informative percentage
   * ---------------------------------------------------------
   */

  const informativePercentage =
    totalSelections > 0
      ? ((summary.informative / totalSelections) * 100).toFixed(1)
      : "0.0";

  /**
   * ---------------------------------------------------------
   * Validation
   * ---------------------------------------------------------
   */

  const validateEvaluations = (): boolean => {
    /**
     * Find rows where:
     *
     * participant exists but evaluation doesn't
     * OR
     * evaluation exists but participant doesn't
     */
    const hasIncompleteRow = evaluations.some((item) => {
      const participant = item.participant?.trim() ?? "";

      const selected = item.selected?.trim() ?? "";

      return (participant && !selected) || (!participant && selected);
    });

    if (hasIncompleteRow) {
      reqForToastAndSetMessage(
        "Please provide both Participant Code and Evaluation for each row.",
        "error"
      );

      return false;
    }

    /**
     * Remove completely empty rows from consideration.
     */
    const filledEvaluations = evaluations.filter(
      (item) => item.participant?.trim() && item.selected?.trim()
    );

    /**
     * At least one evaluation should exist.
     */
    if (filledEvaluations.length === 0) {
      reqForToastAndSetMessage(
        "Please add at least one evaluation before saving.",
        "error"
      );

      return false;
    }

    /**
     * Check duplicate participant codes.
     */
    const participantCodes = filledEvaluations.map((item) =>
      item.participant.trim()
    );

    const uniqueParticipantCodes = new Set(participantCodes);

    if (uniqueParticipantCodes.size !== participantCodes.length) {
      reqForToastAndSetMessage(
        "Each Participant Code must be unique.",
        "error"
      );

      return false;
    }

    return true;
  };

  /**
   * ---------------------------------------------------------
   * Submit
   * ---------------------------------------------------------
   */

  const handleSubmit = () => {
    if (!id) {
      reqForToastAndSetMessage("Training ID is missing.", "error");

      return;
    }

    if (!validateEvaluations()) {
      return;
    }

    /**
     * Only send completed evaluations.
     *
     * Empty rows are not stored in the database.
     */
    const validEvaluations = evaluations
      .filter((item) => item.participant?.trim() && item.selected?.trim())
      .map((item) => ({
        participant: item.participant.trim(),
        selected: item.selected,
      }));

    setIsLoading(true);

    requestHandler()
      .post(`/training_db/training/evaluation/${id}`, {
        evaluations: validEvaluations,
        remark: remark.trim() || null,
      })
      .then((response: any) => {
        reqForToastAndSetMessage(
          response?.data?.message ?? "Evaluation successfully saved !"
        );

        /**
         * Replace local state with the clean data
         * that was actually submitted.
         */
        setEvaluations(validEvaluations);
      })
      .catch((error: any) => {
        reqForToastAndSetMessage(
          error?.response?.data?.message ?? "Failed to save evaluation.",
          "error"
        );
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

  /**
   * ---------------------------------------------------------
   * Render
   * ---------------------------------------------------------
   */

  return (
    <Card className="max-w-5xl mx-auto mt-6 shadow-lg">
      <CardContent className="p-6">
        {/* -------------------------------------------------- */}
        {/* Title */}
        {/* -------------------------------------------------- */}

        <h2 className="text-xl font-bold text-center mb-6">
          Evaluation Section
        </h2>

        {/* -------------------------------------------------- */}
        {/* Evaluation Table */}
        {/* -------------------------------------------------- */}

        <div className="max-h-[400px] overflow-y-auto border rounded-lg">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[140px] text-center">
                  Participant Code
                </TableHead>

                <TableHead className="text-center">Informative</TableHead>

                <TableHead className="text-center">Usefulness</TableHead>

                <TableHead className="text-center">Understanding</TableHead>

                <TableHead className="text-center">Relevance</TableHead>

                <TableHead className="text-center">Applicability</TableHead>

                <TableHead className="w-[60px] text-center">Action</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {evaluations.map((evalItem, index) => (
                <TableRow key={`evaluation-${index}`}>
                  {/* -------------------------------------- */}
                  {/* Participant Code */}
                  {/* -------------------------------------- */}

                  <TableCell className="text-center">
                    <Input
                      value={evalItem.participant}
                      onChange={(e) =>
                        handleParticipantCodeChange(index, e.target.value)
                      }
                      placeholder="Code"
                      className="w-28 mx-auto h-8 text-sm"
                    />
                  </TableCell>

                  {/* -------------------------------------- */}
                  {/* Evaluation Options */}
                  {/* -------------------------------------- */}

                  <RadioGroup
                    orientation="horizontal"
                    className="contents"
                    value={evalItem.selected}
                    onValueChange={(value) => handleSelect(index, value)}
                  >
                    {EvaluationOptions.map((field) => (
                      <TableCell
                        key={`${field}-${index}`}
                        className="text-center"
                      >
                        <div className="flex justify-center items-center h-full">
                          <RadioGroupItem
                            value={field}
                            id={`${field}-${index}`}
                            className="h-4 w-4"
                          />
                        </div>
                      </TableCell>
                    ))}
                  </RadioGroup>

                  {/* -------------------------------------- */}
                  {/* Remove */}
                  {/* -------------------------------------- */}

                  <TableCell className="text-center">
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => removeEvaluation(index)}
                      className="text-red-500 hover:text-red-600 hover:bg-red-50"
                      disabled={isLoading}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}

              {/* -------------------------------------------- */}
              {/* Summary */}
              {/* -------------------------------------------- */}

              <TableRow className="bg-muted/30 font-bold">
                <TableCell className="text-center">Summary</TableCell>

                <TableCell className="text-center">
                  {summary.informative}
                </TableCell>

                <TableCell className="text-center">
                  {summary.usefulness}
                </TableCell>

                <TableCell className="text-center">
                  {summary.understanding}
                </TableCell>

                <TableCell className="text-center">
                  {summary.relevance}
                </TableCell>

                <TableCell className="text-center">
                  {summary.applicability}
                </TableCell>

                <TableCell />
              </TableRow>
            </TableBody>
          </Table>
        </div>

        {/* -------------------------------------------------- */}
        {/* Informative Percentage */}
        {/* -------------------------------------------------- */}

        <div className="mt-5 flex justify-center">
          <div className="px-4 py-2 rounded-md bg-muted/40">
            <p className="font-medium text-center">
              % of positive evaluation (Informative):{" "}
              <span className="font-bold">{informativePercentage}%</span>
            </p>
          </div>
        </div>

        {/* -------------------------------------------------- */}
        {/* Remark */}
        {/* -------------------------------------------------- */}

        <div className="mt-5">
          <label htmlFor="evaluation-remark" className="font-medium">
            Remark:
          </label>

          <Textarea
            id="evaluation-remark"
            placeholder="Type your remark..."
            value={remark}
            onChange={(e) => setRemark(e.target.value)}
            className="mt-2 min-h-[100px]"
            disabled={isLoading}
          />
        </div>

        {/* -------------------------------------------------- */}
        {/* Buttons */}
        {/* -------------------------------------------------- */}

        <div className="flex justify-between items-center mt-6">
          {/* Add Evaluation */}

          <Button
            type="button"
            variant="outline"
            onClick={addEvaluation}
            disabled={isLoading}
            className="flex gap-2"
          >
            <PlusCircle className="w-4 h-4" />
            Add Evaluation
          </Button>

          {/* Save */}

          <Button
            id={SUBMIT_BUTTON_PROVIDER_ID}
            disabled={isLoading || evaluations.length === 0}
            className="bg-blue-600 hover:bg-blue-700"
            onClick={() =>
              reqForConfirmationModelFunc(
                TrainingEvaluationSubmitMessage,
                handleSubmit
              )
            }
          >
            {isLoading ? "Saving ..." : "Save"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default TrainingEvaluationForm;
