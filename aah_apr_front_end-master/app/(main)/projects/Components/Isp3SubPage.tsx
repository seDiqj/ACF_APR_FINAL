"use client";

import React, { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { MultiSelect } from "@/components/multi-select";
import { Label } from "@/components/ui/label";
import { Link2 } from "lucide-react";
import { Indicator, Isp3 } from "../types/Types";
import { useParentContext } from "@/contexts/ParentContext";
import { useProjectEditContext } from "../edit_project/[id]/page";
import { useProjectShowContext } from "../project_show/[id]/page";
import { useProjectContext } from "../create_new_project/page";
import { cardsBottomButtons } from "./CardsBottomButtons";
import { Isp3SubPageInterface } from "@/interfaces/Interfaces";
import {
  IsCreateMode,
  IsIndicatorSaved,
  IsShowMode,
} from "@/constants/Constants";

const Isp3SubPage: React.FC<Isp3SubPageInterface> = ({ mode }) => {
  const { requestHandler, reqForToastAndSetMessage } = useParentContext();

  const {
    indicators,
    setCurrentTab,
    isp3,
    setIsp3,
  }: {
    indicators: Indicator[];
    setCurrentTab: (value: string) => void;
    isp3: Isp3[];
    setIsp3: React.Dispatch<React.SetStateAction<Isp3[]>>;
  } = IsCreateMode(mode)
    ? useProjectContext()
    : IsShowMode(mode)
    ? useProjectShowContext()
    : useProjectEditContext();

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const readOnly = IsShowMode(mode);

  const hundleSubmit = () => {
    if (readOnly) return;
    setIsLoading(true);
    requestHandler()
      .post("/projects/is/isp3", {
        isp3s: isp3,
      })
      .then((response: any) => {
        reqForToastAndSetMessage(response.data.message, "success");
      })
      .catch((error: any) => {
        reqForToastAndSetMessage(error.response?.data?.message || "Error saving ISP3 mapping", "error");
      })
      .finally(() => setIsLoading(false));
  };

  return (
    <>
      <Card className="h-full border border-border bg-card shadow-sm flex flex-col rounded-xl overflow-hidden min-h-[500px]">
        <CardHeader className="border-b pb-4">
          <CardTitle className="text-xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <Link2 className="text-primary" size={22} />
            ISP3 Strategic Alignment
          </CardTitle>
          <p className="text-sm text-muted-foreground mt-0.5">Link quantitative indicators to standardized framework metrics.</p>
        </CardHeader>

        <CardContent className="p-6 overflow-y-auto flex-1 no-scrollbar space-y-4">
          <div className="border border-border rounded-xl divide-y divide-border bg-muted/5 shadow-inner overflow-hidden">
            {isp3.map((item, index) => (
              <div
                key={index}
                className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 hover:bg-muted/30 transition-colors"
              >
                <Label className="font-semibold text-foreground text-sm tracking-wide sm:max-w-[50%] break-words">
                  {item.name}
                </Label>

                <div className="w-full sm:w-[320px] shrink-0">
                  <MultiSelect
                    options={indicators
                      .filter((indicator) => IsIndicatorSaved(indicator))
                      .map((ind) => ({
                        label: ind.indicatorRef,
                        value: String(ind.id),
                      }))}
                    value={item.indicators.map((ind) => String(ind))}
                    onValueChange={(value: string[]) =>
                      setIsp3((prev) =>
                        prev.map((i) =>
                          i.name === item.name ? { ...i, indicators: value } : i
                        )
                      )
                    }
                    placeholder="Select indicator to link"
                    disabled={readOnly}
                  />
                </div>
              </div>
            ))}
          </div>
        </CardContent>

        <CardFooter className="p-6 border-t bg-muted/20 flex justify-end">
          {cardsBottomButtons(
            setCurrentTab,
            "aprPreview",
            readOnly ? undefined : hundleSubmit,
            isLoading,
            setCurrentTab,
            "finalization",
            "isp3"
          )}
        </CardFooter>
      </Card>
    </>
  );
};

export default Isp3SubPage;
