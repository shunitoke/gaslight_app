'use client';

import React from 'react';

import { Card } from '../../components/ui/card';
import { useLanguage } from '../../features/i18n';

export default function TermsPage() {
  const { t } = useLanguage();

  return (
    <div className="min-h-screen bg-background py-12 px-6">
      <div className="max-w-3xl mx-auto space-y-8">
        <h1 className="text-3xl font-bold text-foreground">{t('terms_title')}</h1>
        <Card className="p-6 space-y-4 text-sm text-foreground shadow-xl border-border/30 backdrop-blur-lg" style={{ backgroundColor: 'hsl(var(--card) / 0.85)', willChange: 'background-color, opacity', backfaceVisibility: 'hidden' }}>
          <p>{t('terms_intro')}</p>

          <h2 className="text-xl font-semibold mt-4">{t('terms_operator_title')}</h2>
          <p>{t('terms_operator_content')}</p>

          <h2 className="text-xl font-semibold mt-4">{t('terms_section1_title')}</h2>
          <p>{t('terms_section1_content')}</p>

          <h2 className="text-xl font-semibold mt-4">{t('terms_section2_title')}</h2>
          <p>{t('terms_section2_content')}</p>

          <h2 className="text-xl font-semibold mt-4">{t('terms_section3_title')}</h2>
          <p>{t('terms_section3_content')}</p>

          <h2 className="text-xl font-semibold mt-4">{t('terms_section4_title')}</h2>
          <p>{t('terms_section4_content')}</p>

          <h2 className="text-xl font-semibold mt-4">{t('terms_section5_title')}</h2>
          <p>{t('terms_section5_content')}</p>

          <h2 className="text-xl font-semibold mt-4">{t('terms_section6_title')}</h2>
          <p>{t('terms_section6_content')}</p>

          <h2 className="text-xl font-semibold mt-4">{t('terms_section7_title')}</h2>
          <p>{t('terms_section7_content')}</p>

          <h2 className="text-xl font-semibold mt-4">{t('terms_section8_title')}</h2>
          <p>{t('terms_section8_content')}</p>

          <h2 className="text-xl font-semibold mt-4">{t('terms_section9_title')}</h2>
          <p>{t('terms_section9_content')}</p>
        </Card>
      </div>
    </div>
  );
}

