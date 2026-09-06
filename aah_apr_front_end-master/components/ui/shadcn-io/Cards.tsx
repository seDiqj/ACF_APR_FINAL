"use client";

import { Card, CardContent } from "@/components/ui/card";
import { useParentContext } from "@/contexts/ParentContext";
import { TrendingUp } from "lucide-react";

type AprState = {
  title: string;
  value: number;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
};

const StatsCards = () => {
  const { aprStats } = useParentContext();

  const aprsState: AprState[] = aprStats ?? [];

  return (
    <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
      {aprsState.map((item) => {
        const Icon = item.icon;

        return (
          <Card
            key={item.title}
            className="
              group relative overflow-hidden
              rounded-xl
              border-border/60
              bg-card
              shadow-sm
              transition-all duration-200
              hover:-translate-y-0.5
              hover:shadow-md
              mb-2
            "
          >
            {/* Subtle accent */}
            <div
              className={`absolute inset-x-0 top-0 h-0.5 ${item.color.replace(
                "text-",
                "bg-"
              )}`}
            />

            <CardContent className="p-4">
              <div className="flex items-center justify-between gap-3">
                {/* Icon */}
                <div
                  className={`
                    flex h-10 w-10 shrink-0 items-center justify-center
                    rounded-lg
                    bg-muted/60
                    ring-1 ring-border/50
                    transition-transform duration-200
                    group-hover:scale-105
                  `}
                >
                  <Icon className={`h-5 w-5 ${item.color}`} />
                </div>

                {/* Value */}
                <div className="min-w-0 flex-1 text-right">
                  <p
                    className="
                      truncate
                      text-xs font-medium
                      text-muted-foreground
                    "
                    title={item.title}
                  >
                    {item.title}
                  </p>

                  <p
                    className="
                      mt-0.5
                      text-2xl font-bold
                      tracking-tight
                      text-foreground
                    "
                  >
                    {item.value.toLocaleString()}
                  </p>
                </div>
              </div>

              {/* Footer */}
              <div className="mt-3 flex items-center gap-1.5 text-[11px] text-muted-foreground">
                <TrendingUp className="h-3.5 w-3.5 text-emerald-600" />

                <span>APR Records</span>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};

export default StatsCards;