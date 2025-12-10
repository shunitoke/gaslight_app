'use client';

import Link from 'next/link';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/Button';
import { Separator } from '@/components/ui/separator';
import { useLanguage } from '@/features/i18n';
import type { SupportedLocale } from '@/features/i18n/types';

export type ArticleSection = {
  heading: string;
  items: string[];
  ordered?: boolean;
};

export type ArticleContent = {
  badge: string;
  title: string;
  intro: string;
  appHeading: string;
  appPoints: string[];
  appCta: string;
  sections: ArticleSection[];
};

export type ArticleContentByLocale = Record<SupportedLocale, ArticleContent>;

function AppBlock({ strings }: { strings: ArticleContent }) {
  return (
    <div className="rounded-2xl border border-primary/20 bg-primary/5 p-6 sm:p-7 space-y-3 shadow-sm">
      <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary uppercase tracking-wide">
        <Badge variant="outline" className="border-primary/30 text-primary">
          App
        </Badge>
        Gaslight Analyzer
      </div>
      <h3 className="text-lg font-semibold text-foreground">{strings.appHeading}</h3>
      <ul className="text-sm leading-relaxed text-muted-foreground space-y-1.5 list-disc list-inside">
        {strings.appPoints.map((item, idx) => (
          <li key={idx}>{item}</li>
        ))}
      </ul>
      <div className="pt-1">
        <Link href="/">
          <Button size="lg" className="w-full sm:w-auto">
            {strings.appCta}
          </Button>
        </Link>
      </div>
    </div>
  );
}

export function ArticlePageClient({ content }: { content: ArticleContentByLocale }) {
  const { locale } = useLanguage();
  const strings = content[locale] ?? content.en;

  return (
    <div className="mx-auto max-w-3xl px-4 sm:px-6 py-10 space-y-8">
      <div className="space-y-3">
        <Badge variant="outline" className="border-primary/30 text-primary px-3 py-1.5 text-xs uppercase tracking-wide">
          {strings.badge}
        </Badge>
        <h1 className="text-3xl sm:text-4xl font-bold text-foreground leading-tight">{strings.title}</h1>
        <p className="text-base text-muted-foreground leading-relaxed">{strings.intro}</p>
      </div>

      <Separator />

      <div className="space-y-6 text-base leading-relaxed text-foreground">
        {strings.sections.map((section, idx) => (
          <section key={idx} className="space-y-3">
            <h2 className="text-2xl font-semibold">{section.heading}</h2>
            {section.ordered ? (
              <ol className="space-y-2 text-muted-foreground list-decimal list-inside">
                {section.items.map((item, i) => (
                  <li key={i}>{item}</li>
                ))}
              </ol>
            ) : (
              <ul className="space-y-2 text-muted-foreground list-disc list-inside">
                {section.items.map((item, i) => (
                  <li key={i}>{item}</li>
                ))}
              </ul>
            )}
          </section>
        ))}

        <AppBlock strings={strings} />
      </div>
    </div>
  );
}









