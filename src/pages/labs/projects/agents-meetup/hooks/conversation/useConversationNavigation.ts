
import { useState } from 'react';

export const useConversationNavigation = () => {
  const [currentStep, setCurrentStep] = useState<number>(1);

  const goToStep = (step: number) => {
    if (step <= currentStep || step === currentStep + 1) {
      setCurrentStep(step);
    }
  };

  return {
    currentStep,
    setCurrentStep,
    goToStep
  };
};
