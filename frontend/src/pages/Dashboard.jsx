import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getCustomers } from '../api/client';
import ImpactBanner from '../components/ImpactBanner';
import CustomerTable from '../components/CustomerTable';

const CONTRACT_OPTS = ['Month-to-month', 'One year', 'Two year'];
const RISK_TIERS = ['High', 'Medium', 'Low'];
const EMPTY = { risk_tier: '', contract: '', min_charges: '', max_charges: '' };

export default function Dashboard() {
  const navigate = useNavigate();
  const [pending, setPending] = useState(EMPTY);
  const [active, setActive] = useState({});
  const [customers, setCustomers] = useState([]);
  const [summary, setSummary] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [filtering, setFiltering] = useState(false);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError('');
      try {
        const data = await getCustomers(active);
        setCustomers(data.customers);
        setSummary({
          high_risk_count: data.high_risk_count,
          medium_risk_count: data.medium_risk_count,
          low_risk_count: data.low_risk_count,
          total_monthly_revenue_at_risk: data.total_monthly_revenue_at_risk,
          annual_revenue_at_risk: data.annual_revenue_at_risk,
        });
      } catch {
        setError(
          'Could not reach the API. Make sure the backend is running: cd backend && uvicorn main:app --reload'
        );
      } finally {
        setLoading(false);
        setFiltering(false);
      }
    };
    load();
  }, [active]);

  const applyFilters = () => {
    const f = {};
    if (pending.risk_tier) f.risk_tier = pending.risk_tier;
    if (pending.contract) f.contract = pending.contract;
    if (pending.min_charges !== '') f.min_charges = pending.min_charges;
    if (pending.max_charges !== '') f.max_charges = pending.max_charges;
    setFiltering(true);
    setActive(f);
  };

  const resetFilters = () => {
    setPending(EMPTY);
    setActive({});
  };

  const tierBtnCls = (tier) => {
    const isActive = pending.risk_tier === tier;
    if (!isActive)
      return 'px-3 py-1.5 text-xs rounded-lg text-left transition-colors bg-[#F8FAFC] text-[#64748B] hover:bg-slate-100 font-medium';
    if (tier === '') return 'px-3 py-1.5 text-xs rounded-lg text-left transition-colors bg-[#6366F1] text-white font-semibold';
    if (tier === 'High') return 'px-3 py-1.5 text-xs rounded-lg text-left transition-colors bg-[#EF4444] text-white font-semibold';
    if (tier === 'Medium') return 'px-3 py-1.5 text-xs rounded-lg text-left transition-colors bg-[#F59E0B] text-white font-semibold';
    return 'px-3 py-1.5 text-xs rounded-lg text-left transition-colors bg-[#10B981] text-white font-semibold';
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-[#1E293B]">Customer Dashboard</h1>
        <p className="text-sm text-[#64748B] mt-1">
          {loading ? 'Loading…' : `${customers.length.toLocaleString()} customers · click a row to view details`}
        </p>
      </div>

      <ImpactBanner summary={summary} />

      {error && (
        <div className="mb-5 px-4 py-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-600">
          {error}
        </div>
      )}

      <div className="flex flex-col lg:flex-row gap-5">
        {/* Filter panel */}
        <div className="w-full lg:w-60 flex-shrink-0">
          <div className="bg-white border border-[#E2E8F0] rounded-xl p-5 space-y-5 sticky top-6">
            <h2 className="text-sm font-semibold text-[#1E293B]">Filters</h2>

            {/* Risk tier */}
            <div>
              <p className="text-xs font-medium text-[#64748B] mb-2">Risk Tier</p>
              <div className="flex flex-col gap-1.5">
                <button onClick={() => setPending((f) => ({ ...f, risk_tier: '' }))} className={tierBtnCls('')}>
                  All
                </button>
                {RISK_TIERS.map((t) => (
                  <button
                    key={t}
                    onClick={() => setPending((f) => ({ ...f, risk_tier: t }))}
                    className={tierBtnCls(t)}
                  >
                    {t} Risk
                  </button>
                ))}
              </div>
            </div>

            {/* Contract type */}
            <div>
              <label className="text-xs font-medium text-[#64748B] block mb-1.5">
                Contract Type
              </label>
              <select
                value={pending.contract}
                onChange={(e) => setPending((f) => ({ ...f, contract: e.target.value }))}
                className="w-full px-3 py-2 text-sm border border-[#E2E8F0] rounded-lg bg-white text-[#1E293B] focus:outline-none focus:ring-2 focus:ring-[#6366F1]"
              >
                <option value="">All</option>
                {CONTRACT_OPTS.map((c) => (
                  <option key={c}>{c}</option>
                ))}
              </select>
            </div>

            {/* Monthly charges range */}
            <div>
              <p className="text-xs font-medium text-[#64748B] mb-1.5">
                Monthly Charges ($)
              </p>
              <div className="flex gap-2">
                <input
                  type="number"
                  value={pending.min_charges}
                  onChange={(e) => setPending((f) => ({ ...f, min_charges: e.target.value }))}
                  placeholder="Min"
                  className="w-1/2 px-2 py-1.5 text-sm border border-[#E2E8F0] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#6366F1]"
                />
                <input
                  type="number"
                  value={pending.max_charges}
                  onChange={(e) => setPending((f) => ({ ...f, max_charges: e.target.value }))}
                  placeholder="Max"
                  className="w-1/2 px-2 py-1.5 text-sm border border-[#E2E8F0] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#6366F1]"
                />
              </div>
            </div>

            {/* Actions */}
            <div className="space-y-2 pt-1">
              <button
                onClick={applyFilters}
                disabled={filtering}
                className="w-full py-2 text-sm font-semibold bg-[#6366F1] hover:bg-[#4F46E5] text-white rounded-lg transition-colors disabled:opacity-70 flex items-center justify-center gap-2"
              >
                {filtering && (
                  <svg className="animate-spin h-3.5 w-3.5" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                )}
                {filtering ? 'Applying…' : 'Apply filters'}
              </button>
              <button
                onClick={resetFilters}
                className="w-full py-2 text-sm text-[#64748B] hover:text-[#1E293B] transition-colors"
              >
                Reset
              </button>
            </div>
          </div>
        </div>

        {/* Customer table */}
        <div className="flex-1 min-w-0">
          {!loading && (
            <p className="text-xs text-[#64748B] mb-3">
              Showing {customers.length.toLocaleString()} customers
              {Object.keys(active).length > 0 && (
                <span className="text-[#6366F1] font-medium"> · filters active</span>
              )}
            </p>
          )}
          <CustomerTable
            customers={customers}
            onSelectCustomer={(id) => navigate(`/customers/${id}`)}
            loading={loading}
          />
        </div>
      </div>
    </div>
  );
}
