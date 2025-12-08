'use client';

import Link from 'next/link';

import { PaddleCheckoutButton } from '../../components/subscription/PaddleCheckoutButton';
import { Card, CardBase } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Check, Shield, Sparkles } from 'lucide-react';
import { useLanguage } from '../../features/i18n';

const priceDisplay = process.env.NEXT_PUBLIC_PREMIUM_PRICE ?? '$9.99';
const email = 'spinnermining@gmail.com';

export default function PricingPage() {
  const { t } = useLanguage();

  const freeFeatures = [t('pricing_free_item1'), t('pricing_free_item2'), t('pricing_free_item3')];

  const premiumFeatures = [
    t('pricing_premium_item1'),
    t('pricing_premium_item2'),
    t('pricing_premium_item3'),
    t('pricing_premium_item4')
  ];

  return (
    <div className="min-h-screen bg-background py-12 px-6">
      <div className="max-w-5xl mx-auto space-y-8">
        <div className="space-y-3 text-center">
          <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 text-primary px-3 py-1 text-xs font-semibold uppercase tracking-wide">
            <Shield className="h-4 w-4" />
            {t('pricing_badge_text')}
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-foreground">{t('pricing_title')}</h1>
          <p className="text-muted-foreground max-w-3xl mx-auto">{t('pricing_description')}</p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <Card className="p-6 space-y-4 border-border/50">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">{t('pricing_free_label')}</p>
                <h2 className="text-2xl font-semibold text-foreground">{t('pricing_free_price_label')}</h2>
              </div>
              <Badge tone="warning" variant="outline">
                {t('pricing_free_badge')}
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground">{t('pricing_free_description')}</p>
            <ul className="space-y-2 text-sm text-muted-foreground">
              {freeFeatures.map((item) => (
                <li key={item} className="flex items-start gap-2">
                  <Check className="h-4 w-4 text-green-500 mt-0.5" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
            <Link
              href="/"
              className="inline-flex items-center justify-center rounded-md border border-border px-4 py-2 text-sm font-medium hover:border-primary hover:text-primary transition-colors"
            >
              {t('pricing_free_cta')}
            </Link>
          </Card>

          <Card className="p-6 space-y-4 border-primary/40 shadow-lg shadow-primary/10 bg-primary/5">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-sm text-primary font-semibold">{t('pricing_premium_label')}</p>
                <div className="flex items-baseline gap-2">
                  <h2 className="text-3xl font-bold text-foreground">{priceDisplay}</h2>
                  <span className="text-sm text-muted-foreground">{t('pricing_price_unit')}</span>
                </div>
              </div>
              <Sparkles className="h-6 w-6 text-primary" />
            </div>
            <p className="text-sm text-muted-foreground">{t('pricing_premium_description')}</p>
            <ul className="space-y-2 text-sm text-muted-foreground">
              {premiumFeatures.map((item) => (
                <li key={item} className="flex items-start gap-2">
                  <Check className="h-4 w-4 text-primary mt-0.5" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
            <PaddleCheckoutButton label={t('pricing_premium_cta')} variant="primary" size="lg" className="w-full" />
            <p className="text-xs text-muted-foreground">{t('pricing_checkout_note')}</p>
          </Card>
        </div>

        <CardBase className="p-5 space-y-3">
          <h3 className="text-lg font-semibold text-foreground">{t('pricing_what_you_get_title')}</h3>
          <div className="grid gap-3 md:grid-cols-3 text-sm text-muted-foreground">
            <div className="space-y-1">
              <p className="font-semibold text-foreground">{t('pricing_what_evidence_title')}</p>
              <p>{t('pricing_what_evidence_text')}</p>
            </div>
            <div className="space-y-1">
              <p className="font-semibold text-foreground">{t('pricing_what_exports_title')}</p>
              <p>{t('pricing_what_exports_text')}</p>
            </div>
            <div className="space-y-1">
              <p className="font-semibold text-foreground">{t('pricing_what_onetime_title')}</p>
              <p>{t('pricing_what_onetime_text')}</p>
            </div>
          </div>
          <div className="text-xs text-muted-foreground">
            {t('pricing_help_text_prefix')}{' '}
            <a className="underline hover:text-primary" href={`mailto:${email}`}>
              {email}
            </a>
            {t('pricing_help_text_suffix')}
          </div>
        </CardBase>
      </div>
    </div>
  );
}


