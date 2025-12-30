
import React from 'react';
import { Info } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Profile } from './types';

interface ProfileInfoPopoverProps {
  selectedProfile: Profile | undefined;
}

export const ProfileInfoPopover: React.FC<ProfileInfoPopoverProps> = ({ selectedProfile }) => {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <span>
            <Popover>
              <PopoverTrigger asChild>
                <button 
                  className="inline-flex text-muted-foreground hover:text-foreground transition-colors" 
                  aria-label="View profile instructions"
                >
                  <Info className="h-3.5 w-3.5" />
                </button>
              </PopoverTrigger>
              <PopoverContent className="w-80 p-4" align="center">
                <div className="space-y-2">
                  <h4 className="font-medium">Profile Instructions</h4>
                  <p className="text-sm text-muted-foreground">
                    {selectedProfile?.description}
                  </p>
                  <div className="text-xs text-foreground p-2 bg-muted rounded border border-border mt-2">
                    <p className="font-medium mb-1">Instructions sent to the AI:</p>
                    <p className="whitespace-pre-wrap text-muted-foreground">
                      {selectedProfile?.instructions || 
                        `Act as an ${selectedProfile?.name}. ${selectedProfile?.description}`}
                    </p>
                  </div>
                </div>
              </PopoverContent>
            </Popover>
          </span>
        </TooltipTrigger>
        <TooltipContent>
          <p className="text-xs">View profile instructions</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};
