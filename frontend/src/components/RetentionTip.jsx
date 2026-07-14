export default function RetentionTip({ recommendation, riskTier }) {
  if (riskTier !== 'High' && riskTier !== 'Medium') return null;

  return (
    <div className="bg-white rounded-xl border border-[#E2E8F0] border-l-4 border-l-[#F59E0B] p-4">
      <div className="flex items-start gap-3">
        <span className="text-xl mt-0.5" aria-hidden="true">💡</span>
        <div className="space-y-1 min-w-0">
          <p className="text-sm font-semibold text-[#1E293B]">
            Retention recommendation
          </p>
          <p className="text-sm text-[#1E293B]">{recommendation}</p>
          <p className="text-xs text-[#64748B] pt-1">
            Estimated action window: 30–60 days before churn
          </p>
        </div>
      </div>
    </div>
  );
}
