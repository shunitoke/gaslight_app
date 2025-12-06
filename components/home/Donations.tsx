'use client';

import dynamic from 'next/dynamic';
import React, { useState } from 'react';
import { Shield, X } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Card, CardBase } from '@/components/ui/card';
import { Button } from '@/components/ui/Button';
import { useLanguage } from '@/features/i18n';
import { WALLET_ADDRESSES, getQrImageUrl, type WalletInfo } from '@/lib/donations';

const DonationsQRImage = dynamic(
  () =>
    import('@/components/ui/card').then(() => ({ default: (props: { src: string; alt: string }) => (
      <img
        src={props.src}
        alt={props.alt}
        className="h-64 w-64 object-contain"
        loading="lazy"
      />
    ) })),
  { ssr: false, loading: () => <div className="h-64 w-64 animate-pulse rounded-lg bg-muted/30" /> }
);

export function Donations() {
  const { t } = useLanguage();
  const [selectedWallet, setSelectedWallet] = useState<WalletInfo | null>(null);

  return (
    <>
      <CardBase className="mx-auto w-full max-w-4xl bg-gradient-to-r from-destructive/10 via-destructive/15 to-destructive/10 border border-destructive/30 shadow-md p-0">
        {/* Mobile */}
        <div className="sm:hidden px-4 py-3 space-y-2.5">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-destructive/15 text-destructive font-semibold text-xs">
            <span>β ❤️</span>
            <span>{t('donation_beta_label')}</span>
          </div>
          <div className="space-y-1">
            <h3 className="text-base font-semibold text-foreground">{t('donation_title')}</h3>
            <p className="text-xs text-muted-foreground">{t('donation_text')}</p>
            <div className="inline-flex px-2 py-1 rounded bg-destructive/20 text-destructive text-[11px] font-semibold">
              {t('donation_crypto_only')}
            </div>
          </div>
          <details className="group mt-2">
            <summary className="cursor-pointer text-xs font-semibold text-destructive flex items-center gap-1.5 select-none">
              <span className="group-open:rotate-90 transition-transform">›</span>
              {t('donation_show_qr')}
            </summary>
            <div className="grid grid-cols-3 gap-2 text-xs mt-2">
              {WALLET_ADDRESSES.map((wallet) => (
                <button
                  key={wallet.id}
                  onClick={() => setSelectedWallet(wallet)}
                  className="aspect-square rounded-lg border border-border/70 bg-background/90 shadow-sm hover:border-primary/60 hover:shadow-md transition-all duration-150 flex items-center justify-center text-center font-semibold text-foreground text-[11px] px-1"
                >
                  {wallet.label}
                </button>
              ))}
            </div>
          </details>
        </div>

        {/* Desktop */}
        <div className="hidden sm:block px-5 py-4 space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-destructive/20 text-destructive font-semibold text-xs">
            <span>β ❤️</span>
            <span>{t('donation_beta_label')}</span>
          </div>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2.5">
            <div className="space-y-1">
              <h3 className="text-lg sm:text-xl font-semibold text-foreground">
                {t('donation_title')}
              </h3>
              <p className="text-sm text-muted-foreground">
                {t('donation_text')}
              </p>
            </div>
            <div className="self-start sm:self-center px-3 py-1 rounded-full bg-destructive/20 text-destructive text-xs font-semibold">
              {t('donation_crypto_only')}
            </div>
          </div>
          <details className="mt-3 group">
            <summary className="cursor-pointer text-sm font-semibold text-destructive flex items-center gap-2 select-none">
              <span className="group-open:rotate-90 transition-transform">›</span>
              {t('donation_show_qr')}
            </summary>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3 text-xs mt-3">
              {WALLET_ADDRESSES.map((wallet) => (
                <div
                  key={wallet.id}
                  className="p-3 rounded-lg border border-border/70 bg-background/80 shadow-sm hover:border-primary/60 hover:shadow-md transition-all duration-150"
                >
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <div className="text-sm font-semibold text-foreground">{wallet.label}</div>
                    <Button
                      variant="outline"
                      size="sm"
                      className="whitespace-nowrap"
                      onClick={() => setSelectedWallet(wallet)}
                    >
                      {t('donation_show_qr')}
                    </Button>
                  </div>
                  <div className="text-xs font-mono text-foreground/80 break-all">{wallet.address}</div>
                </div>
              ))}
            </div>
          </details>
        </div>
      </CardBase>

      {selectedWallet && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
          onClick={() => setSelectedWallet(null)}
        >
          <Card className="w-full max-w-sm mx-4" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-start justify-between p-4 pb-2">
              <div>
                <p className="text-xs text-muted-foreground">{t('donation_qr_for_wallet')}</p>
                <p className="text-base font-semibold text-foreground">{selectedWallet.label}</p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedWallet(null)}
                className="text-muted-foreground hover:text-foreground transition-colors p-1"
                aria-label={t('donation_close')}
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="p-4 pt-2 flex flex-col items-center gap-3">
              <div className="rounded-lg border border-border bg-background p-3">
                <DonationsQRImage
                  src={getQrImageUrl(selectedWallet.address)}
                  alt={`${selectedWallet.label} QR`}
                />
              </div>
              <p className="text-xs font-mono text-muted-foreground break-all text-center">
                {selectedWallet.address}
              </p>
              <Button variant="outline" size="sm" className="w-full" onClick={() => setSelectedWallet(null)}>
                {t('donation_close')}
              </Button>
            </div>
          </Card>
        </div>
      )}
    </>
  );
}


