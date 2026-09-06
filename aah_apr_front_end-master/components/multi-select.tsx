"use client";

import * as React from "react";
import { Check, ChevronsUpDown } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";

export type Option = {
  value: string;
  label: string;
};

interface MultiSelectProps {
  options: Option[];
  value: string[];
  onValueChange?: (value: string[]) => void;
  placeholder?: string;
  disabled?: boolean;
  error?: string | undefined;
}

export function MultiSelect({
  options,
  value,
  onValueChange,
  placeholder = "Select...",
  disabled = false,
  error,
}: MultiSelectProps) {
  const [open, setOpen] = React.useState(false);

  const selectedOptions = options.filter((opt) => value?.includes(opt.value));

  const toggleOption = (val: string) => {
    if (disabled) return;
    if (!onValueChange) return;

    if (value.includes(val)) {
      onValueChange(value.filter((v) => v !== val));
    } else {
      onValueChange([...value, val]);
    }
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn(
            // use strong overrides to beat global css
            "w-full justify-between text-left",
            // if there's an error, force a visible red border and ring
            error
              ? "!border-2 !border-red-500 focus:!ring-red-200 focus:!ring-4"
              : "!border !border-[var(--border)]",
            disabled && "opacity-60 cursor-not-allowed"
          )}
          title={error ? error : undefined}
          disabled={disabled}
        >
          <div className="flex gap-1 max-h-16 overflow-auto">
            {selectedOptions.length > 0 ? (
              selectedOptions.map((opt) => (
                <Badge key={opt.value} variant="secondary">
                  {opt.label}
                </Badge>
              ))
            ) : (
              <span className="text-muted-foreground">{placeholder}</span>
            )}
          </div>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      {!disabled && (
        <PopoverContent className="w-[300px] p-0 max-h-[200px]">
          <Command className="flex h-full flex-col">
            <CommandInput placeholder="Search..." />
            <CommandEmpty>No results found.</CommandEmpty>
            <div className="flex-1 overflow-y-auto">
              <CommandGroup>
                {options.map((opt) => {
                  const isSelected = value?.includes(opt.value);
                  return (
                    <CommandItem
                      key={opt.value}
                      onSelect={() => toggleOption(opt.value)}
                    >
                      <div
                        className={cn(
                          "mr-2 flex h-4 w-4 items-center justify-center rounded-sm border border-primary",
                          isSelected ? "bg-primary text-primary-foreground" : ""
                        )}
                      >
                        {isSelected && <Check className="h-3 w-3" />}
                      </div>
                      {opt.label}
                    </CommandItem>
                  );
                })}
              </CommandGroup>
            </div>
          </Command>
        </PopoverContent>
      )}
    </Popover>
  );
}
