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
  CommandList, // ۱. اضافه شدن این ایمپورت برای فعال‌سازی اسکرول
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
import { useParentContext } from "@/contexts/ParentContext";
import { AxiosError, AxiosResponse } from "axios";

type Option = {
  value: string;
  label: string;
};

interface SingleSelectProps {
  options: Option[];
  value: string;
  onValueChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  error?: string | undefined;
  searchURL?: string | undefined;
  className?: string;
}

export function SingleSelect({
  options,
  value,
  onValueChange,
  placeholder = "Select...",
  disabled,
  error,
  searchURL,
  className,
}: SingleSelectProps) {
  const { axiosInstance, reqForToastAndSetMessage } = useParentContext();

  const [componentOptions, setComponentOptions] =
    React.useState<Option[]>(options);

  const [open, setOpen] = React.useState(false);

  const toggleOption = (val: string) => {
    if (value === val) onValueChange("");
    else onValueChange(val);
  };

  const [searchInput, setSearchInput] = React.useState<string>("");
  const [lockSearch, setLockSearch] = React.useState<boolean>(false);

  const handleSearch = () => {
    setLockSearch(true);
    axiosInstance
      .get(`${searchURL}?search=${searchInput}`)
      .then((response: AxiosResponse<any, any>) =>
        setComponentOptions(
          response.data.data.data.map(
            (option: { id: string; name: string }) => ({
              value: option.id,
              label: option.name.toString().toUpperCase(),
            })
          )
        )
      )
      .catch((error: AxiosError<any, any>) =>
        reqForToastAndSetMessage(error.response?.data.message)
      )
      .finally(() => setLockSearch(false));
  };

  React.useEffect(() => {
    if (searchInput && searchURL) handleSearch();
  }, [searchInput]);

  React.useEffect(() => setComponentOptions(options), [options]);

  return (
    <div className={cn("w-full", className)}>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            aria-invalid={!!error}
            disabled={disabled}
            className={cn(
              "w-full justify-between text-left",
              error
                ? "!border-2 !border-red-500 focus:!ring-red-200 focus:!ring-4"
                : "!border !border-[var(--border)]",
              disabled && "opacity-60 cursor-not-allowed"
            )}
            title={error ? error : undefined}
          >
            <div className="flex gap-1 items-center overflow-auto">
              {value ? (
                <Badge variant="secondary">
                  {/* اصلاح شد: جستجو در میان کل گزینه‌های موجود کامپوننت انجام می‌شود */}
                  {componentOptions
                    .find((v) => v.value === value)
                    ?.label?.toUpperCase() || value}
                </Badge>
              ) : (
                <span className="text-muted-foreground">{placeholder}</span>
              )}
            </div>
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[300px] p-0" align="start">
          <Command>
            <CommandInput
              className="border-0 outline-none focus:ring-0"
              placeholder="Search..."
              disabled={disabled || lockSearch}
              onValueChange={(search) => setSearchInput(search)}
            />
            {/* ۲. اضافه شدن CommandList به دور لیست برای برگرداندن اسکرول نیتیو */}
            <CommandList className="max-h-64 overflow-y-auto custom-scrollbar">
              <CommandEmpty>No results found.</CommandEmpty>
              <CommandGroup>
                {componentOptions.map((opt) => {
                  const isSelected = value === opt.value;
                  return (
                    <CommandItem
                      key={opt.value}
                      value={opt.label} // فیلتر داخلی بر اساس متن لیبل انجام شود
                      onSelect={() => {
                        if (!disabled) {
                          toggleOption(opt.value);
                          setOpen(false); // بستن اتوماتیک پاپ‌اور بعد از انتخاب گزینه
                        }
                      }}
                    >
                      <div
                        className={cn(
                          "mr-2 flex h-4 w-4 items-center justify-center rounded-sm border",
                          isSelected
                            ? "bg-primary text-primary-foreground border-primary"
                            : "border-[var(--border)]"
                        )}
                      >
                        {isSelected && <Check className="h-3 w-3" />}
                      </div>
                      {opt.label}
                    </CommandItem>
                  );
                })}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  );
}
