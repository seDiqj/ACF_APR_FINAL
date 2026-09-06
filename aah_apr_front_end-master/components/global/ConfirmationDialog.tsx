"use client";

import * as React from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { GeneralMessage } from "@/constants/ConfirmationModelsTexts";
import { SUBMIT_BUTTON_PROVIDER_ID } from "@/config/System";
import { AlertTriangle } from "lucide-react";

interface ComponentProps {
  open: boolean;
  onOpenChange: (value: boolean) => void;
  details: string;
  onContinue: () => void;
}

const ConfirmationAlertDialogue: React.FC<ComponentProps> = ({
  open,
  onOpenChange,
  details,
  onContinue,
}) => {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="bg-card border border-border text-card-foreground max-w-[440px] rounded-lg shadow-xl p-6">
        <AlertDialogHeader className="flex flex-col items-center text-center sm:text-left sm:items-start sm:flex-row gap-4">
          {/* Visual Alert Anchor Icon */}
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-destructive/10 text-destructive">
            <AlertTriangle className="h-5 w-5" />
          </div>

          <div className="space-y-1.5 flex-1">
            <AlertDialogTitle className="text-lg font-bold tracking-tight text-foreground">
              {GeneralMessage || "Are you absolutely sure?"}
            </AlertDialogTitle>
            <AlertDialogDescription className="text-sm text-muted-foreground leading-relaxed whitespace-normal break-words">
              {details}
            </AlertDialogDescription>
          </div>
        </AlertDialogHeader>

        <AlertDialogFooter className="mt-6 flex flex-col-reverse sm:flex-row gap-2">
          <AlertDialogCancel
            onClick={() => onOpenChange(false)}
            className="mt-0 w-full sm:w-auto bg-secondary text-secondary-foreground hover:bg-secondary/80 border-none h-10 rounded-md text-xs font-medium transition-colors"
          >
            Cancel
          </AlertDialogCancel>

          <AlertDialogAction
            id={SUBMIT_BUTTON_PROVIDER_ID}
            type="button"
            onClick={onContinue}
            className="w-full sm:w-auto bg-primary text-primary-foreground hover:bg-primary/90 h-10 rounded-md text-xs font-medium transition-colors shadow-sm"
          >
            Continue
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default ConfirmationAlertDialogue;
