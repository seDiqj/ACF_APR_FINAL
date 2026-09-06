"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Save } from "lucide-react";
import { useParentContext } from "@/contexts/ParentContext";
import { IsCreateMode } from "@/constants/Constants";
import {
  Isp3CreationMessage,
  ProjectCreationMessage,
  ProjectEditMessage,
} from "@/constants/ConfirmationModelsTexts";
import {
  ARROW_LEFT_BUTTON_PROVIDER,
  ARROW_RIGHT_BUTTON_PROVIDER,
  SUBMIT_BUTTON_PROVIDER_ID,
} from "@/config/System";

export const cardsBottomButtons = (
  backBtnOnClick: (val: string) => void,
  backBtnOnClickFuncInput: string,
  saveBtnOnClick: (() => void) | undefined,
  isLoading: boolean,
  nextBtnOnClick: (val: string) => void,
  nextBtnOnClickFuncInput: string,
  section?: "project" | "isp3",
  mode?: "create" | "edit",
  backBtnDisabled?: boolean,
  nextBtnDisabled?: boolean,
  saveBtnDisabled?: boolean,
) => {
  const { reqForConfirmationModelFunc } = useParentContext();

  return (
    <div className="flex w-full items-center justify-between gap-3 pt-4 border-t border-border mt-auto bg-background">
      {/* دکمه بازگشت */}
      <Button
        id={ARROW_LEFT_BUTTON_PROVIDER}
        disabled={backBtnDisabled}
        variant="outline"
        onClick={() => backBtnOnClick(backBtnOnClickFuncInput)}
        className="h-10 px-4 gap-2 rounded-lg transition-all border-muted hover:bg-muted"
      >
        <ChevronLeft size={16} /> Back
      </Button>

      {/* دکمه ذخیره میانی - در صورت وجود اکشن و سکشن رندر می‌شود */}
      {saveBtnOnClick && section && (
        <Button
          id={SUBMIT_BUTTON_PROVIDER_ID}
          disabled={isLoading || saveBtnDisabled}
          onClick={() =>
            reqForConfirmationModelFunc(
              getConfirmationMessage(section, mode),
              saveBtnOnClick
            )
          }
          className="h-10 px-6 gap-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/95 shadow-sm transition-all min-w-[110px]"
        >
          {isLoading ? "Saving..." : <><Save size={16} /> Save</>}
        </Button>
      )}

      {/* دکمه بعدی */}
      <Button
        id={ARROW_RIGHT_BUTTON_PROVIDER}
        disabled={nextBtnDisabled}
        onClick={() => nextBtnOnClick(nextBtnOnClickFuncInput)}
        variant="outline"
        className="h-10 px-4 gap-2 rounded-lg transition-all border-muted hover:bg-muted"
      >
        Next <ChevronRight size={16} />
      </Button>
    </div>
  );
};

// تابع کمکی برای پیدا کردن پیام تاییدیه - اکنون پارامتر mode را به درستی دریافت می‌کند
function getConfirmationMessage(section: string, mode?: "create" | "edit"): string {
  switch (section) {
    case "project":
      return mode && IsCreateMode(mode) ? ProjectCreationMessage : ProjectEditMessage;
    default:
      return Isp3CreationMessage;
  }
}
