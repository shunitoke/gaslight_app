'use client';

import { Card } from '../../components/ui/card';
import { useLanguage } from '../../features/i18n';

const email = 'spinnermining@gmail.com';

export default function PrivacyPage() {
  const { t } = useLanguage();
  const lastUpdated = new Date().toISOString().slice(0, 10);

  return (
    <div className="min-h-screen bg-background py-12 px-6">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="space-y-2">
          <p className="text-sm uppercase tracking-wide text-primary/80">{t('legal_label')}</p>
          <h1 className="text-3xl font-bold text-foreground">{t('privacy_title')}</h1>
          <p className="text-sm text-muted-foreground">
            {t('legal_last_updated')} {lastUpdated}
          </p>
        </div>

        <Card
          className="p-6 space-y-5 text-sm text-foreground shadow-xl border-border/30 backdrop-blur-lg"
          style={{ backgroundColor: 'hsl(var(--card) / 0.85)', willChange: 'background-color, opacity', backfaceVisibility: 'hidden' }}
        >
          <p>{t('privacy_intro')}</p>

          <div className="space-y-2">
            <h2 className="text-xl font-semibold">{t('privacy_collect_title')}</h2>
            <ul className="list-disc pl-5 space-y-1 text-muted-foreground">
              <li>{t('privacy_collect_item1')}</li>
              <li>{t('privacy_collect_item2')}</li>
              <li>{t('privacy_collect_item3')}</li>
            </ul>
          </div>

          <div className="space-y-2">
            <h2 className="text-xl font-semibold">{t('privacy_use_title')}</h2>
            <ul className="list-disc pl-5 space-y-1 text-muted-foreground">
              <li>{t('privacy_use_item1')}</li>
              <li>{t('privacy_use_item2')}</li>
              <li>{t('privacy_use_item3')}</li>
            </ul>
          </div>

          <div className="space-y-2">
            <h2 className="text-xl font-semibold">{t('privacy_retention_title')}</h2>
            <p className="text-muted-foreground">{t('privacy_retention_text')}</p>
          </div>

          <div className="space-y-2">
            <h2 className="text-xl font-semibold">{t('privacy_payment_title')}</h2>
            <p className="text-muted-foreground">{t('privacy_payment_text')}</p>
          </div>

          <div className="space-y-2">
            <h2 className="text-xl font-semibold">{t('privacy_choices_title')}</h2>
            <ul className="list-disc pl-5 space-y-1 text-muted-foreground">
              <li>{t('privacy_choices_item1')}</li>
              <li>{t('privacy_choices_item2')}</li>
              <li>{t('privacy_choices_item3')}</li>
            </ul>
          </div>

          <div className="space-y-2">
            <h2 className="text-xl font-semibold">{t('privacy_contact_title')}</h2>
            <p className="text-muted-foreground">
              {t('privacy_contact_text_prefix')}{' '}
              <a href={`mailto:${email}`} className="underline hover:text-primary">
                {email}
              </a>
              {t('privacy_contact_text_suffix')}
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
}


