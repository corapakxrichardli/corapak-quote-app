'use client';

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { QuoteWizard } from '@/components/quotes/QuoteWizard';
import { initialFormState } from '@/lib/quoteTypes';

export default function NewQuotePage() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);

  const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1';
  const handleSaveDraft = useCallback(async (data: object) => {
    setSaving(true);
    try {
      const res = await fetch(`${API}/quotes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      const quote = await res.json();
      router.push(`/quotes/${quote.id}/review`);
    } catch (e) {
      console.error(e);
      alert('Failed to save draft');
    } finally {
      setSaving(false);
    }
  }, [router]);

  const handleContinueToReview = useCallback(async (data: object) => {
    setSaving(true);
    try {
      const res = await fetch(`${API}/quotes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      const quote = await res.json();
      router.push(`/quotes/${quote.id}/review`);
    } catch (e) {
      console.error(e);
      alert('Failed to save quote');
    } finally {
      setSaving(false);
    }
  }, [router]);

  return (
    <main className="min-h-screen p-8">
      <QuoteWizard
        initialData={initialFormState}
        onSaveDraft={handleSaveDraft}
        onContinueToReview={handleContinueToReview}
        saving={saving}
      />
    </main>
  );
}
