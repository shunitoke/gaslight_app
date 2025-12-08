'use client';

import React, { useEffect, useState } from 'react';

type PurchaseRecord = {
  transactionId: string;
  tokenIssuedAt: number;
  expiresAt?: number;
  priceId?: string | null;
  amount?: number | null;
  currency?: string | null;
  deliveredCount?: number;
  lastDeliveredAt?: number | null;
};

type DeliveryRecord = {
  transactionId: string;
  reportId: string;
  deliveredAt: number;
};

export default function PurchasesAdminPage() {
  const [secret, setSecret] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [rows, setRows] = useState<PurchaseRecord[]>([]);
  const [selectedTx, setSelectedTx] = useState<string | null>(null);
  const [deliveries, setDeliveries] = useState<DeliveryRecord[]>([]);
  const [deliveriesLoading, setDeliveriesLoading] = useState(false);
  const [deliveriesError, setDeliveriesError] = useState<string | null>(null);

  const fetchData = async (provided?: string) => {
    const useSecret = provided ?? secret;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/admin/purchases?limit=200', {
        headers: useSecret ? { 'x-admin-secret': useSecret } : undefined
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || 'Request failed');
      }
      const data = await res.json();
      setRows(Array.isArray(data.purchases) ? data.purchases : []);
    } catch (err) {
      setError((err as Error).message || 'Failed to load');
    } finally {
      setLoading(false);
    }
  };

  const fetchDeliveries = async (tx: string) => {
    setDeliveriesLoading(true);
    setDeliveriesError(null);
    try {
      const res = await fetch(`/api/admin/purchases/${encodeURIComponent(tx)}?limit=50`, {
        headers: secret ? { 'x-admin-secret': secret } : undefined
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || 'Failed to load deliveries');
      }
      const data = await res.json();
      setDeliveries(Array.isArray(data.deliveries) ? data.deliveries : []);
      setSelectedTx(tx);
    } catch (err) {
      setDeliveriesError((err as Error).message || 'Failed to load deliveries');
    } finally {
      setDeliveriesLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
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
                <th className="px-3 py-2 font-semibold">Delivered</th>
                <th className="px-3 py-2 font-semibold">Price</th>
                <th className="px-3 py-2 font-semibold">Actions</th>
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
                        <div className="flex flex-col text-xs">
                          <span className="font-semibold">
                            {typeof r.deliveredCount === 'number' ? r.deliveredCount : 0}
                          </span>
                          <span className="text-muted-foreground">
                            {r.lastDeliveredAt
                              ? new Date(r.lastDeliveredAt).toLocaleString()
                              : '—'}
                          </span>
                        </div>
                      </td>
                    <td className="px-3 py-2">
                      {r.currency ? `${(r.amount ?? 0) / 100} ${r.currency}` : '—'}
                      {r.priceId ? <span className="ml-2 text-xs text-muted-foreground">{r.priceId}</span> : null}
                    </td>
                      <td className="px-3 py-2">
                        <button
                          className="text-primary text-xs underline hover:opacity-80"
                          onClick={() => fetchDeliveries(r.transactionId)}
                          disabled={deliveriesLoading && selectedTx === r.transactionId}
                        >
                          {deliveriesLoading && selectedTx === r.transactionId ? 'Loading…' : 'View deliveries'}
                        </button>
                      </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {selectedTx && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-background border border-border rounded-lg shadow-xl max-w-3xl w-full mx-4 p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold">Deliveries</h2>
                <p className="text-sm text-muted-foreground break-all">Transaction: {selectedTx}</p>
              </div>
              <button
                className="rounded border border-border px-3 py-1 text-sm hover:bg-muted"
                onClick={() => {
                  setSelectedTx(null);
                  setDeliveries([]);
                  setDeliveriesError(null);
                }}
              >
                Close
              </button>
            </div>

            {deliveriesError && (
              <div className="text-sm text-destructive">{deliveriesError}</div>
            )}

            {deliveriesLoading ? (
              <div className="text-sm text-muted-foreground">Loading…</div>
            ) : deliveries.length === 0 ? (
              <div className="text-sm text-muted-foreground">No deliveries yet.</div>
            ) : (
              <div className="max-h-96 overflow-auto rounded border border-border">
                <table className="min-w-full text-sm">
                  <thead className="bg-muted/50">
                    <tr className="text-left">
                      <th className="px-3 py-2 font-semibold">Report ID</th>
                      <th className="px-3 py-2 font-semibold">Delivered</th>
                    </tr>
                  </thead>
                  <tbody>
                    {deliveries.map((d) => (
                      <tr key={d.reportId} className="border-t border-border/60">
                        <td className="px-3 py-2 font-mono text-xs break-all">{d.reportId}</td>
                        <td className="px-3 py-2">{new Date(d.deliveredAt).toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}




