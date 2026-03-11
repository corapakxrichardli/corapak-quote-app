'use client';

import { useState } from 'react';
import { OpportunityStep } from './steps/OpportunityStep';
import { ProductSpecStep } from './steps/ProductSpecStep';
import { CommercialTermsStep } from './steps/CommercialTermsStep';
import { CustomerCommitmentStep } from './steps/CustomerCommitmentStep';
import type { QuoteFormState } from '@/lib/quoteTypes';

const STEPS = [
  { id: 1, label: 'Opportunity', component: OpportunityStep },
  { id: 2, label: 'Product', component: ProductSpecStep },
  { id: 3, label: 'Commercial', component: CommercialTermsStep },
  { id: 4, label: 'Customer Commitment', component: CustomerCommitmentStep },
];

interface QuoteWizardProps {
  initialData: QuoteFormState;
  onSaveDraft: (data: QuoteFormState) => void;
  onContinueToReview: (data: QuoteFormState) => void;
  saving: boolean;
}

export function QuoteWizard({ initialData, onSaveDraft, onContinueToReview, saving }: QuoteWizardProps) {
  const [step, setStep] = useState(0);
  const [data, setData] = useState<QuoteFormState>(initialData);

  const StepComponent = STEPS[step].component;

  const update = (patch: Partial<QuoteFormState>) => {
    setData((d) => ({ ...d, ...patch }));
  };

  const handleNext = () => {
    if (step < STEPS.length - 1) setStep((s) => s + 1);
  };

  const handleBack = () => {
    if (step > 0) setStep((s) => s - 1);
  };

  const handleSaveDraft = () => {
    onSaveDraft(data);
  };

  const handleContinueToReview = () => {
    onContinueToReview(data);
  };

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="text-2xl font-bold">New Quote</h1>
      <div className="mt-4 flex gap-2">
        {STEPS.map((s, i) => (
          <span
            key={s.id}
            className={`rounded px-2 py-1 text-sm ${i === step ? 'bg-slate-900 text-white' : 'bg-slate-200 text-slate-600'}`}
          >
            {i + 1}. {s.label}
          </span>
        ))}
      </div>

      <div className="mt-8 rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
        <StepComponent data={data} update={update} />
      </div>

      <div className="mt-6 flex justify-between">
        <div>
          <button
            type="button"
            onClick={handleBack}
            disabled={step === 0}
            className="rounded border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 disabled:opacity-50"
          >
            Back
          </button>
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={handleSaveDraft}
            disabled={saving}
            className="rounded border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 disabled:opacity-50"
          >
            Save Draft
          </button>
          {step < STEPS.length - 1 ? (
            <button
              type="button"
              onClick={handleNext}
              className="rounded bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800"
            >
              Next
            </button>
          ) : (
            <button
              type="button"
              onClick={handleContinueToReview}
              disabled={saving}
              className="rounded bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800 disabled:opacity-50"
            >
              Continue to Review
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
