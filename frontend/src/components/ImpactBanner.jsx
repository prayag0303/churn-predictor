const fmt = (n) =>
  '$' +
  Number(n).toLocaleString('en-US', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });

export default function ImpactBanner({ summary = {} }) {
  const {
    high_risk_count = 0,
    total_monthly_revenue_at_risk = 0,
    annual_revenue_at_risk = 0,
  } = summary;

  const cards = [
    {
      label: 'Customers at risk',
      value: Number(high_risk_count).toLocaleString(),
      color: 'text-[#EF4444]',
    },
    {
      label: 'Monthly revenue at risk',
      value: fmt(total_monthly_revenue_at_risk),
      color: 'text-[#F59E0B]',
    },
    {
      label: 'Annual revenue at risk',
      value: fmt(annual_revenue_at_risk),
      color: 'text-[#EF4444]',
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
      {cards.map((card) => (
        <div
          key={card.label}
          className="bg-white border border-[#E2E8F0] rounded-xl p-5 flex flex-col gap-1.5"
        >
          <p className="text-xs font-medium text-[#64748B] uppercase tracking-wide">
            {card.label}
          </p>
          <p className={`text-3xl font-bold ${card.color}`}>{card.value}</p>
        </div>
      ))}
    </div>
  );
}
