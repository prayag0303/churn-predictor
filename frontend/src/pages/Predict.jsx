import { useState } from 'react';
import PredictForm from '../components/PredictForm';
import RiskGauge from '../components/RiskGauge';
import ShapChart from '../components/ShapChart';
import RetentionTip from '../components/RetentionTip';

export default function Predict() {
  const [result, setResult] = useState(null);

  const riskBadgeCls =
    result?.risk_tier === 'High'
      ? 'bg-red-50 text-red-600'
      : result?.risk_tier === 'Medium'
      ? 'bg-amber-50 text-amber-600'
      : 'bg-emerald-50 text-emerald-600';

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-[#1E293B]">
          Predict churn for a new customer
        </h1>
        <p className="text-sm text-[#64748B] mt-1">
          Enter customer details to get an instant churn probability with SHAP explanation.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
        {/* Form — independently scrollable so the result panel stays fully visible */}
        <div className="bg-white border border-[#E2E8F0] rounded-xl p-6 overflow-y-auto max-h-[calc(100vh-180px)] lg:sticky lg:top-6">
          <PredictForm onResult={setResult} />
        </div>

        {/* Result panel — flex column, independently scrollable, slides in from right */}
        <div
          className={`flex flex-col gap-4 overflow-y-auto max-h-[calc(100vh-180px)] transition-all duration-500 ease-out ${
            result
              ? 'opacity-100 translate-x-0'
              : 'opacity-0 translate-x-8 pointer-events-none'
          }`}
        >
          {result && (
            <>
              <div className="bg-white border border-[#E2E8F0] rounded-xl p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-base font-semibold text-[#1E293B]">
                    Prediction result
                  </h2>
                  <span
                    className={`px-2.5 py-1 rounded-full text-xs font-semibold ${riskBadgeCls}`}
                  >
                    {result.risk_tier} Risk
                  </span>
                </div>
                <RiskGauge probability={result.churn_probability} />
              </div>

              <div className="bg-white border border-[#E2E8F0] rounded-xl p-6">
                <ShapChart shapFeatures={result.top_shap_features} />
              </div>

              <RetentionTip
                recommendation={result.retention_recommendation}
                riskTier={result.risk_tier}
              />
            </>
          )}
        </div>
      </div>
    </div>
  );
}
