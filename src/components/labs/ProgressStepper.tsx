
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
    <div className="flex items-center justify-center mb-12 px-4">
      <div className="flex items-center space-x-8 max-w-4xl">{/* increased spacing and max-width */}
        {[1, 2, 3, 4].map((step) => {
          const stepState = getStepState(step);
          return (
            <React.Fragment key={step}>
              <div className="flex flex-col items-center">{/* changed to flex-col and removed wrapping div */}
                <div 
                  className={`relative flex items-center justify-center ${
                    stepState === 'completed' || stepState === 'current' ? 'cursor-pointer' : 'cursor-not-allowed'
                  }`}
                  role="button"
                  tabIndex={stepState === 'completed' || stepState === 'current' ? 0 : -1}
                  aria-current={stepState === 'current' ? 'step' : undefined}
                  aria-disabled={stepState === 'not-started'}
                  onClick={() => {
                    if (stepState === 'completed' || stepState === 'current') {
                      goToStep(step);
                    }
                  }}
                >
                  <div className={`flex items-center justify-center h-10 w-10 rounded-full border-2 transition-all duration-200 ${
                    stepState === 'completed' 
                      ? 'bg-primary/15 border-primary text-primary shadow-sm' 
                      : stepState === 'current'
                        ? 'bg-primary/20 border-primary text-primary shadow-md scale-105'
                        : 'bg-muted border-border text-muted-foreground hover:border-muted-foreground/40'
                  }`}>
                    {stepState === 'completed' ? (
                      <CheckCircle className="h-5 w-5" />
                    ) : (
                      <span className="text-sm font-medium">{step}</span>
                    )}
                  </div>
                  <div className={`mt-2 text-xs font-medium transition-colors text-center ${
                    stepState === 'current' ? 'text-primary' : 'text-muted-foreground'
                  }`}>
                    {step === 1 ? 'API Settings' : 
                     step === 2 ? 'Agent Configuration' : 
                     step === 3 ? 'Conversation' : 'Analysis'}
                  </div>
                </div>
              </div>
              {step < 4 && (
                <div className={`flex-1 h-1 mx-4 rounded-full transition-colors ${
                  stepState === 'completed' ? 'bg-primary' : 'bg-muted'
                }`} />
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
};
