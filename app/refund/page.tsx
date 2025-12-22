'use client';

import { Card } from '../../components/ui/card';
import { useLanguage } from '../../features/i18n';

export default function RefundPolicyPage() {
  const { t } = useLanguage();
  const lastUpdated = new Date().toISOString().slice(0, 10);

  const paddleRefundUrl = 'https://paddle.net/';

  return (
    <div className="min-h-screen bg-background py-12 px-6">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="space-y-2">
          <p className="text-sm uppercase tracking-wide text-primary/80">{t('legal_label')}</p>
          <h1 className="text-3xl font-bold text-foreground">{t('refund_title')}</h1>
          <p className="text-sm text-muted-foreground">
            {t('legal_last_updated')} {lastUpdated}
          </p>
        </div>

        <Card
          className="p-6 space-y-5 text-sm text-foreground shadow-xl border-border/30 backdrop-blur-lg"
          style={{ backgroundColor: 'hsl(var(--card) / 0.85)', willChange: 'background-color, opacity', backfaceVisibility: 'hidden' }}
        >
          <p>{t('refund_intro')}</p>

          <div className="space-y-2">
            <h2 className="text-xl font-semibold">{t('refund_contact_title')}</h2>
            <p className="text-muted-foreground">
              {t('refund_contact_text_prefix')}{' '}
              <a href={paddleRefundUrl} target="_blank" rel="noopener noreferrer" className="underline hover:text-primary">
                paddle.net
              </a>{' '}
              {t('refund_contact_text_suffix')}
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
}


