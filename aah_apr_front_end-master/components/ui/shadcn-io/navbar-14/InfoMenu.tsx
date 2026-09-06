'use client';

import * as React from 'react';
import { InfoIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export interface InfoMenuProps {
  onItemClick?: (item: string) => void;
}

export const InfoMenu = React.forwardRef<
  HTMLButtonElement,
  InfoMenuProps
>(({ onItemClick }, ref) => {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          ref={ref}
          size="icon"
          variant="ghost"
          className="text-muted-foreground size-8 rounded-full shadow-none"
          aria-label="Information menu"
        >
          <InfoIcon size={16} aria-hidden="true" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel>Information</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => onItemClick?.('help')}>
          Help & Support
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => onItemClick?.('documentation')}>
          Documentation
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => onItemClick?.('tutorials')}>
          Tutorials
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => onItemClick?.('feedback')}>
          Send Feedback
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => onItemClick?.('about')}>
          About
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
});

InfoMenu.displayName = 'InfoMenu';

export default InfoMenu;