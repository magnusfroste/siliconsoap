import React from 'react';
import { Form, FormField, FormItem, FormControl } from '@/components/ui/form';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { UseFormReturn } from 'react-hook-form';
import { ProfileInfoPopover } from './ProfileInfoPopover';
import { Profile } from './types';
import { Check } from 'lucide-react';

interface ProfileSelectorProps {
  form: UseFormReturn<{ persona: string }>;
  agentPersona: string;
  handleAgentPersonaChange: (value: string) => void;
  profiles: Profile[];
  isDisabled: boolean;
  borderColorClass: string;
  selectedProfile: Profile | undefined;
}

export const ProfileSelector: React.FC<ProfileSelectorProps> = ({
  form,
  agentPersona,
  handleAgentPersonaChange,
  profiles,
  isDisabled,
  borderColorClass,
  selectedProfile,
}) => {
  return (
    <div>
      <h3 className="text-xs font-medium mb-1 flex items-center gap-1">
        Profile
        <ProfileInfoPopover selectedProfile={selectedProfile} />
      </h3>
      <Form {...form}>
        <FormField
          control={form.control}
          name="persona"
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <RadioGroup
                  value={field.value}
                  onValueChange={(value) => {
                    field.onChange(value);
                    handleAgentPersonaChange(value);
                  }}
                  className="grid grid-cols-2 gap-2"
                  disabled={isDisabled}
                >
                  {profiles.map((profile) => {
                    const isSelected = agentPersona === profile.id;
                    return (
                      <div 
                        key={profile.id}
                        onClick={() => {
                          if (!isDisabled) {
                            field.onChange(profile.id);
                            handleAgentPersonaChange(profile.id);
                          }
                        }}
                        className={`
                          relative cursor-pointer p-2.5 rounded-md border-2 transition-all
                          ${isSelected 
                            ? 'border-primary bg-primary/10' 
                            : 'border-border hover:border-primary/50 hover:bg-muted/50'
                          }
                          ${isDisabled ? 'opacity-50 cursor-not-allowed' : ''}
                        `}
                      >
                        <div className="flex items-center gap-2">
                          <span className="p-1 bg-primary/10 rounded-full shrink-0">
                            {profile.icon}
                          </span>
                          <span className="text-xs font-medium leading-tight">
                            {profile.name}
                          </span>
                        </div>
                        {isSelected && (
                          <Check className="absolute top-1.5 right-1.5 h-3.5 w-3.5 text-primary" />
                        )}
                        <RadioGroupItem 
                          value={profile.id} 
                          disabled={isDisabled}
                          className="sr-only"
                        />
                      </div>
                    );
                  })}
                </RadioGroup>
              </FormControl>
            </FormItem>
          )}
        />
      </Form>
    </div>
  );
};
