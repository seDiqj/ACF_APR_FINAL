'use client';

import * as React from 'react';
import { SettingsIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export interface SettingsMenuProps {
  onItemClick?: (item: string) => void;
}

export const SettingsMenu = React.forwardRef<
  HTMLButtonElement,
  SettingsMenuProps
>(({ onItemClick }, ref) => {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          ref={ref}
          size="icon"
          variant="ghost"
          className="text-muted-foreground size-8 rounded-full shadow-none"
          aria-label="Settings menu"
        >
          <SettingsIcon size={16} aria-hidden="true" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel>Settings</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => onItemClick?.('preferences')}>
          Preferences
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => onItemClick?.('appearance')}>
          Appearance
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => onItemClick?.('privacy')}>
          Privacy & Security
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => onItemClick?.('integrations')}>
          Integrations
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => onItemClick?.('api-keys')}>
          API Keys
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => onItemClick?.('billing')}>
          Billing
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
});

SettingsMenu.displayName = 'SettingsMenu';

export default SettingsMenu;