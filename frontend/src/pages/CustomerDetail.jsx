import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getCustomer } from '../api/client';
import RiskGauge from '../components/RiskGauge';
import ShapChart from '../components/ShapChart';
import RetentionTip from '../components/RetentionTip';

function getRec(features) {
  if (!features?.length)
    return 'Reach out personally with a customised retention offer.';
  const top = features[0].feature;
  if (top.includes('Contract')) return 'Offer a 12-month contract with a 15% discount.';
  if (top.includes('tenure')) return 'This is a new customer. Assign a dedicated onboarding rep.';
  if (top.includes('TechSupport')) return 'Offer 3 months of free TechSupport.';
  if (top.includes('OnlineSecurity')) return 'Offer a free OnlineSecurity add-on for 6 months.';
  if (top.includes('MonthlyCharges')) return 'Offer a loyalty discount of 10% on current plan.';
  return 'Reach out personally with a customised retention offer.';
}

function RiskBadge({ tier }) {
  const cls =
    tier === 'High'
      ? 'bg-red-50 text-red-600'
      : tier === 'Medium'
      ? 'bg-amber-50 text-amber-600'
      : 'bg-emerald-50 text-emerald-600';
  return (
    <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-semibold ${cls}`}>
      {tier} Risk
    </span>
  );
}

function StatRow({ label, value }) {
  return (
    <div className="flex items-center justify-between py-2.5 border-b border-[#F1F5F9] last:border-0">
      <span className="text-sm text-[#64748B]">{label}</span>
      <span className="text-sm font-semibold text-[#1E293B]">{value}</span>
    </div>
  );
}

function Spinner() {
  return (
    <div className="flex justify-center items-center py-24">
      <svg className="animate-spin h-8 w-8 text-[#6366F1]" viewBox="0 0 24 24" fill="none">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
      </svg>
    </div>
  );
}

export default function CustomerDetail() {
  const { id } = useParams();
  const [customer, setCustomer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError('');
      try {
        const data = await getCustomer(id);
        setCustomer(data);
      } catch (err) {
        setError(
          err.response?.status === 404
            ? 'Customer not found.'
            : 'Failed to load customer. Try again.'
        );
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id]);

  if (loading) return <Spinner />;

  if (error) {
    return (
      <div className="bg-white border border-[#E2E8F0] rounded-xl p-10 text-center">
        <p className="text-[#EF4444] font-medium mb-3">{error}</p>
        <Link to="/" className="text-sm text-[#6366F1] hover:underline">
          ← Return to dashboard
        </Link>
      </div>
    );
  }

  if (!customer) return null;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
      {/* ── Left column ── */}
      <div className="bg-white border border-[#E2E8F0] rounded-xl p-6 space-y-5">
        {/* Back link */}
        <Link
          to="/"
          className="inline-flex items-center gap-1.5 text-sm text-[#64748B] hover:text-[#1E293B] transition-colors"
        >
          ← Back to dashboard
        </Link>

        {/* Heading + badge */}
        <div className="space-y-2">
          <h1 className="text-2xl font-bold text-[#1E293B]">
            Customer #{customer.customer_id}
          </h1>
          <RiskBadge tier={customer.risk_tier} />
        </div>

        {/* Stat rows */}
        <div className="divide-y divide-[#F1F5F9]">
          <StatRow label="Contract type" value={customer.contract} />
          <StatRow
            label="Monthly charges"
            value={`$${customer.monthly_charges.toFixed(2)}`}
          />
          <StatRow label="Tenure" value={`${customer.tenure} months`} />
          <StatRow
            label="Churn probability"
            value={`${Math.round(customer.churn_probability * 100)}%`}
          />
        </div>

        {/* Gauge — bottom of left column */}
        <RiskGauge probability={customer.churn_probability} />
      </div>

      {/* ── Right column ── */}
      <div className="space-y-4">
        <div className="bg-white border border-[#E2E8F0] rounded-xl p-6">
          <ShapChart shapFeatures={customer.top_shap_features} />
        </div>
        <RetentionTip
          recommendation={getRec(customer.top_shap_features)}
          riskTier={customer.risk_tier}
        />
      </div>
    </div>
  );
}
