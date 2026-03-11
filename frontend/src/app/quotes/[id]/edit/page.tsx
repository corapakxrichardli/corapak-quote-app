'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { QuoteWizard } from '@/components/quotes/QuoteWizard';
import { api } from '@/lib/api';
import { initialFormState, type QuoteFormState } from '@/lib/quoteTypes';

export default function EditQuotePage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const [data, setData] = useState<QuoteFormState | null>(null);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.quotes.get(id)
      .then((q) => {
        setData({
          ...initialFormState,
          customer_id: q.customer_id || null,
          project_name: q.project_name || '',
          sales_rep: q.sales_rep || '',
          quote_date: q.quote_date || initialFormState.quote_date,
          expected_close_date: q.expected_close_date || '',
          opportunity_size: q.opportunity_size ? Number(q.opportunity_size) : null,
          confidence_level: q.confidence_level || 'medium',
          opportunity_notes: q.opportunity_notes || '',
          product_config: {
            ...initialFormState.product_config,
            ...q.product_config,
          },
          quoted_quantity: q.quoted_quantity || 1000,
          annual_forecast_volume: q.annual_forecast_volume ? Number(q.annual_forecast_volume) : null,
          commitment_type: q.commitment_type || 'spot_order',
          payment_terms: q.payment_terms || 'Net 30',
          target_price: q.target_price ? Number(q.target_price) : null,
          margin_target: q.margin_target ?? 25,
          customer_commitment_id: q.customer_commitment_id || null,
          customer_commitment_details: q.customer_commitment_details || {},
        });
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [id]);

  const handleSaveDraft = useCallback(async (formData: QuoteFormState) => {
    setSaving(true);
    try {
      await api.quotes.update(id, formData);
      router.push(`/quotes/${id}/review`);
    } catch (e) {
      console.error(e);
      alert('Failed to save');
    } finally {
      setSaving(false);
    }
  }, [id, router]);

  const handleContinueToReview = useCallback(async (formData: QuoteFormState) => {
    setSaving(true);
    try {
      await api.quotes.update(id, formData);
      await api.quotes.calculate(id);
      router.push(`/quotes/${id}/review`);
    } catch (e) {
      console.error(e);
      alert('Failed to save');
    } finally {
      setSaving(false);
    }
  }, [id, router]);

  if (loading || !data) return <div className="p-8">Loading...</div>;

  return (
    <main className="min-h-screen p-8">
      <QuoteWizard
        initialData={data}
        onSaveDraft={handleSaveDraft}
        onContinueToReview={handleContinueToReview}
        saving={saving}
      />
    </main>
  );
}
