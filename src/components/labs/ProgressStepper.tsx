
import React from 'react';
import { CheckCircle } from 'lucide-react';

type StepState = 'not-started' | 'completed' | 'current';

interface ProgressStepperProps {
  currentStep: number;
  goToStep: (step: number) => void;
}

export const ProgressStepper: React.FC<ProgressStepperProps> = ({ currentStep, goToStep }) => {
  const getStepState = (stepNumber: number): StepState => {
    if (stepNumber < currentStep) return 'completed';
    if (stepNumber === currentStep) return 'current';
    return 'not-started';
  };

  return (
    <div className="flex items-center justify-center mb-8">
      <div className="flex items-center w-full max-w-3xl">
        {[1, 2, 3, 4].map((step) => {
          const stepState = getStepState(step);
          return (
              <div className="flex items-center" key={step}>
                <div 
                  className={`relative flex items-center justify-center ${
                    stepState === 'completed' || stepState === 'current' ? 'cursor-pointer' : 'cursor-not-allowed'
                  }`}
                  onClick={() => goToStep(step)}
                >
                  <div className={`flex items-center justify-center h-10 w-10 rounded-full border-2 transition-colors ${
                    stepState === 'completed' 
                      ? 'bg-green-100 border-green-500 text-green-500' 
                      : stepState === 'current'
                        ? 'bg-purple-100 border-purple-500 text-purple-500'
                        : 'bg-gray-100 border-gray-300 text-gray-400'
                  }`}>
                    {stepState === 'completed' ? (
                      <CheckCircle className="h-5 w-5" />
                    ) : (
                      <span className="text-sm font-medium">{step}</span>
                    )}
                  </div>
                  <div className="absolute -bottom-6 whitespace-nowrap text-xs font-medium">
                    {step === 1 ? 'API Settings' : 
                     step === 2 ? 'Agent Configuration' : 
                     step === 3 ? 'Conversation' : 'Analysis'}
                  </div>
                </div>
                {step < 4 && (
                  <div className={`flex-1 h-1 mx-2 ${
                    stepState === 'completed' ? 'bg-green-500' : 'bg-gray-200'
                  }`} />
                )}
              </div>
          );
        })}
      </div>
    </div>
  );
};
