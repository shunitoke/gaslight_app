'use client';

import React, { useEffect, useState } from 'react';

type PurchaseRecord = {
  transactionId: string;
  tokenIssuedAt: number;
  expiresAt?: number;
  priceId?: string | null;
  amount?: number | null;
  currency?: string | null;
};

export default function PurchasesAdminPage() {
  const [secret, setSecret] = useState<string>(() => (typeof window !== 'undefined' ? sessionStorage.getItem('admin_secret') || '' : ''));
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [rows, setRows] = useState<PurchaseRecord[]>([]);

  const fetchData = async (provided?: string) => {
    const useSecret = provided ?? secret;
    if (!useSecret) {
      setError('Enter admin secret');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/admin/purchases?limit=200', {
        headers: { 'x-admin-secret': useSecret }
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || 'Request failed');
      }
      const data = await res.json();
      setRows(Array.isArray(data.purchases) ? data.purchases : []);
      sessionStorage.setItem('admin_secret', useSecret);
    } catch (err) {
      setError((err as Error).message || 'Failed to load');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (secret) fetchData(secret);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="min-h-screen bg-background text-foreground py-10 px-6">
      <div className="max-w-5xl mx-auto space-y-6">
        <header className="space-y-2">
          <h1 className="text-3xl font-bold">Premium unlocks</h1>
          <p className="text-sm text-muted-foreground">
            Shows transaction ids and token issuance time for premium reports. Keep the admin secret safe.
          </p>
          <div className="flex flex-wrap gap-2 items-center">
            <input
              type="password"
              value={secret}
              onChange={(e) => setSecret(e.target.value)}
              placeholder="Admin secret"
              className="w-64 rounded border border-border bg-background px-3 py-2 text-sm"
            />
            <button
              onClick={() => fetchData()}
              disabled={loading}
              className="inline-flex items-center gap-1 rounded-md border border-border px-3 py-2 text-sm hover:bg-muted disabled:opacity-50"
            >
              {loading ? 'Loading…' : 'Load'}
            </button>
            {error && <span className="text-xs text-red-500">{error}</span>}
          </div>
        </header>

        <div className="overflow-auto rounded border border-border">
          <table className="min-w-full text-sm">
            <thead className="bg-muted/50">
              <tr className="text-left">
                <th className="px-3 py-2 font-semibold">Transaction ID</th>
                <th className="px-3 py-2 font-semibold">Issued</th>
                <th className="px-3 py-2 font-semibold">Expires</th>
                <th className="px-3 py-2 font-semibold">Price</th>
              </tr>
            </thead>
            <tbody>
              {rows.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-3 py-4 text-center text-muted-foreground">
                    {loading ? 'Loading…' : 'No records'}
                  </td>
                </tr>
              ) : (
                rows.map((r) => (
                  <tr key={r.transactionId} className="border-t border-border/60">
                    <td className="px-3 py-2 font-mono text-xs break-all">{r.transactionId}</td>
                    <td className="px-3 py-2">{new Date(r.tokenIssuedAt).toLocaleString()}</td>
                    <td className="px-3 py-2">
                      {r.expiresAt ? new Date(r.expiresAt).toLocaleString() : '—'}
                    </td>
                    <td className="px-3 py-2">
                      {r.currency ? `${(r.amount ?? 0) / 100} ${r.currency}` : '—'}
                      {r.priceId ? <span className="ml-2 text-xs text-muted-foreground">{r.priceId}</span> : null}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}


