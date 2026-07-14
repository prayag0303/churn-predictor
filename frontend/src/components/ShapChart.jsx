import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Cell,
  ReferenceLine,
  ResponsiveContainer,
} from 'recharts';

const NUMERICAL = new Set([
  'tenure',
  'MonthlyCharges',
  'TotalCharges',
  'charges_per_month_ratio',
  'service_count',
  'tenure_bucket',
  'contract_risk',
]);

function cleanName(name) {
  if (NUMERICAL.has(name)) {
    return name
      .replace(/_/g, ' ')
      .replace(/([A-Z])/g, ' $1')
      .trim()
      .split(/\s+/)
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(' ');
  }
  const idx = name.indexOf('_');
  if (idx === -1) return name;
  const prefix = name
    .slice(0, idx)
    .replace(/([A-Z])/g, ' $1')
    .trim();
  const suffix = name.slice(idx + 1);
  // "TechSupport_Yes" → "Tech Support" (suffix redundant)
  if (suffix === 'Yes') return prefix;
  // "Contract_Month-to-month" → "Contract: Month-to-month"
  return `${prefix}: ${suffix}`;
}

function CustomTooltip({ active, payload }) {
  if (!active || !payload?.length) return null;
  const d = payload[0].payload;
  return (
    <div className="bg-white border border-[#E2E8F0] rounded-lg px-3 py-2 shadow-sm text-xs">
      <p className="font-medium text-[#1E293B] mb-0.5">{d.name}</p>
      <p style={{ color: d.direction === 'increases_risk' ? '#EF4444' : '#10B981' }}>
        SHAP: {Number(d.value).toFixed(4)}
      </p>
    </div>
  );
}

export default function ShapChart({ shapFeatures = [] }) {
  const data = shapFeatures.map((f) => ({
    name: cleanName(f.feature),
    value: f.value,
    direction: f.direction,
  }));

  const maxAbs = Math.max(...data.map((d) => Math.abs(d.value)), 0.01);
  const domain = [-maxAbs * 1.3, maxAbs * 1.3];

  return (
    <div>
      <h3 className="text-sm font-semibold text-[#1E293B] mb-4">
        Why is this customer at risk?
      </h3>
      <ResponsiveContainer width="100%" height={230}>
        <BarChart
          layout="vertical"
          data={data}
          margin={{ top: 0, right: 20, left: 8, bottom: 8 }}
        >
          <CartesianGrid
            strokeDasharray="3 3"
            horizontal={false}
            stroke="#F1F5F9"
          />
          <XAxis
            type="number"
            domain={domain}
            tickCount={5}
            tickFormatter={(v) => v.toFixed(2)}
            tick={{ fontSize: 10, fill: '#94A3B8' }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            type="category"
            dataKey="name"
            width={148}
            tick={{ fontSize: 11, fill: '#1E293B' }}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip content={<CustomTooltip />} cursor={{ fill: '#F8FAFC' }} />
          <ReferenceLine x={0} stroke="#CBD5E1" strokeWidth={1.5} />
          <Bar dataKey="value" radius={[0, 3, 3, 0]} maxBarSize={16}>
            {data.map((entry, i) => (
              <Cell
                key={i}
                fill={entry.direction === 'increases_risk' ? '#EF4444' : '#10B981'}
                fillOpacity={0.82}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
      <div className="flex justify-between text-[10px] text-[#94A3B8] px-3 mt-1">
        <span>← reduces risk</span>
        <span>increases risk →</span>
      </div>
    </div>
  );
}
