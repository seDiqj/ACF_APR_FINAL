import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuPortal,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Checkbox } from "../ui/checkbox";

interface MultiLevelDropDownProps {
  triggerText: string;
  mainLabel: string;
  subMenuItems: { label: string; subItems: { id: string; label: string }[] }[];
  onCheckboxChange?: (state: boolean) => void;
}

export function MultiLevelDropDown({
  triggerText,
  mainLabel,
  subMenuItems,
  onCheckboxChange,
}: MultiLevelDropDownProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline">{triggerText}</Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent className="w-56" align="start">
        <DropdownMenuLabel>{mainLabel}</DropdownMenuLabel>
        <DropdownMenuGroup>
          {subMenuItems?.map((item, index) => (
            <DropdownMenuSub>
            <DropdownMenuSubTrigger>{item.label}</DropdownMenuSubTrigger>
            <DropdownMenuPortal>
              <DropdownMenuSubContent>
                {item.subItems.map((subItem, index) => (
                  <DropdownMenuItem
                    key={index}
                    onClick={(e) => {
                      e.stopPropagation();
                      e.preventDefault();
                    }}
                  >
                    {subItem.label}
                    <Checkbox onCheckedChange={onCheckboxChange}></Checkbox>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuSubContent>
            </DropdownMenuPortal>
          </DropdownMenuSub>
            ))}
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
