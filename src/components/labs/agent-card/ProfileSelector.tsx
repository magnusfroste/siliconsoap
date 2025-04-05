
import React from 'react';
import { Form, FormField, FormItem, FormControl } from '@/components/ui/form';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { UseFormReturn } from 'react-hook-form';
import { ProfileInfoPopover } from './ProfileInfoPopover';
import { Profile } from './types';

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
                  {profiles.map((profile) => (
                    <div 
                      key={profile.id}
                      className={`flex items-center p-2 rounded-md border ${
                        agentPersona === profile.id ? `border-${borderColorClass.split('-')[1]} bg-${borderColorClass.split('-')[1]}-50` : 'border-gray-200'
                      } ${isDisabled ? 'opacity-50' : ''}`}
                    >
                      <label className="flex items-center gap-1 cursor-pointer w-full text-xs">
                        <RadioGroupItem value={profile.id} disabled={isDisabled} />
                        <div className="flex items-center gap-1">
                          <span className="p-1 bg-purple-100 rounded-full">
                            {profile.icon}
                          </span>
                          <span>{profile.name}</span>
                        </div>
                      </label>
                    </div>
                  ))}
                </RadioGroup>
              </FormControl>
            </FormItem>
          )}
        />
      </Form>
    </div>
  );
};
