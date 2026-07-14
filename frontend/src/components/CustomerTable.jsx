import { useState, useEffect } from 'react';

const PAGE_SIZE = 50;

function riskColor(tier) {
  if (tier === 'High') return '#EF4444';
  if (tier === 'Medium') return '#F59E0B';
  return '#10B981';
}

function RiskBadge({ tier }) {
  const cls =
    tier === 'High'
      ? 'bg-red-50 text-red-600'
      : tier === 'Medium'
      ? 'bg-amber-50 text-amber-600'
      : 'bg-emerald-50 text-emerald-600';
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold ${cls}`}>
      {tier}
    </span>
  );
}

const SKEL_W = ['55%', '60%', '70%', '65%', '45%', '75%'];

function SkeletonRow() {
  return (
    <tr className="border-b border-[#E2E8F0]">
      {SKEL_W.map((w, i) => (
        <td key={i} className="px-4 py-3">
          <div className="h-3.5 bg-slate-200 rounded animate-pulse" style={{ width: w }} />
        </td>
      ))}
    </tr>
  );
}

export default function CustomerTable({
  customers = [],
  onSelectCustomer,
  loading = false,
}) {
  const [page, setPage] = useState(0);

  // Reset to first page whenever the customer list changes (new filter applied)
  useEffect(() => setPage(0), [customers]);

  const total = customers.length;
  const totalPages = Math.ceil(total / PAGE_SIZE) || 1;
  const slice = customers.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);

  return (
    <div className="bg-white border border-[#E2E8F0] rounded-xl overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm min-w-[640px]">
          <thead>
            <tr className="bg-[#F8FAFC] border-b border-[#E2E8F0]">
              {[
                'Customer ID',
                'Risk Tier',
                'Churn Probability',
                'Monthly Charges',
                'Tenure',
                'Contract',
              ].map((h) => (
                <th
                  key={h}
                  className="px-4 py-3 text-left text-xs font-semibold text-[#64748B] uppercase tracking-wide whitespace-nowrap"
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              Array.from({ length: 8 }).map((_, i) => <SkeletonRow key={i} />)
            ) : slice.length === 0 ? (
              <tr>
                <td
                  colSpan={6}
                  className="px-4 py-14 text-center text-[#64748B] text-sm"
                >
                  No customers match these filters.
                </td>
              </tr>
            ) : (
              slice.map((c) => {
                const prob = c.churn_probability;
                const color = riskColor(c.risk_tier);
                return (
                  <tr
                    key={c.customer_id}
                    onClick={() => onSelectCustomer?.(c.customer_id)}
                    className="border-b border-[#E2E8F0] hover:bg-[#F8FAFC] cursor-pointer transition-colors"
                  >
                    <td className="px-4 py-3 font-mono text-xs text-[#94A3B8]">
                      #{c.customer_id}
                    </td>
                    <td className="px-4 py-3">
                      <RiskBadge tier={c.risk_tier} />
                    </td>
                    {/* Probability cell with translucent progress bar behind text */}
                    <td className="px-4 py-3 relative w-36">
                      <div
                        className="absolute inset-y-0 left-0 rounded-r pointer-events-none"
                        style={{
                          width: `${prob * 100}%`,
                          backgroundColor: color,
                          opacity: 0.12,
                        }}
                      />
                      <span
                        className="relative font-semibold tabular-nums"
                        style={{ color }}
                      >
                        {Math.round(prob * 100)}%
                      </span>
                    </td>
                    <td className="px-4 py-3 text-[#1E293B] tabular-nums">
                      ${c.monthly_charges.toFixed(2)}
                    </td>
                    <td className="px-4 py-3 text-[#1E293B] tabular-nums">
                      {c.tenure} mo
                    </td>
                    <td className="px-4 py-3 text-[#64748B] whitespace-nowrap">
                      {c.contract}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination — only shown when results exceed one page */}
      {!loading && total > PAGE_SIZE && (
        <div className="flex items-center justify-between px-4 py-3 border-t border-[#E2E8F0] text-sm">
          <span className="text-[#64748B]">
            {(page * PAGE_SIZE + 1).toLocaleString()}–
            {Math.min((page + 1) * PAGE_SIZE, total).toLocaleString()} of{' '}
            {total.toLocaleString()} customers
          </span>
          <div className="flex items-center gap-2">
            <button
              disabled={page === 0}
              onClick={() => setPage((p) => p - 1)}
              className="px-3 py-1.5 border border-[#E2E8F0] rounded-lg text-[#64748B] hover:bg-[#F8FAFC] disabled:opacity-40 disabled:cursor-not-allowed transition-colors text-xs"
            >
              ← Prev
            </button>
            <span className="text-xs text-[#64748B] px-1">
              {page + 1} / {totalPages}
            </span>
            <button
              disabled={page >= totalPages - 1}
              onClick={() => setPage((p) => p + 1)}
              className="px-3 py-1.5 border border-[#E2E8F0] rounded-lg text-[#64748B] hover:bg-[#F8FAFC] disabled:opacity-40 disabled:cursor-not-allowed transition-colors text-xs"
            >
              Next →
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
