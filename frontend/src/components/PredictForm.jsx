import { useState } from 'react';
import { predictCustomer } from '../api/client';

const OPTIONS = {
  gender: ['Male', 'Female'],
  Partner: ['Yes', 'No'],
  Dependents: ['Yes', 'No'],
  PhoneService: ['Yes', 'No'],
  MultipleLines: ['Yes', 'No', 'No phone service'],
  InternetService: ['DSL', 'Fiber optic', 'No'],
  OnlineSecurity: ['Yes', 'No', 'No internet service'],
  OnlineBackup: ['Yes', 'No', 'No internet service'],
  DeviceProtection: ['Yes', 'No', 'No internet service'],
  TechSupport: ['Yes', 'No', 'No internet service'],
  StreamingTV: ['Yes', 'No', 'No internet service'],
  StreamingMovies: ['Yes', 'No', 'No internet service'],
  Contract: ['Month-to-month', 'One year', 'Two year'],
  PaperlessBilling: ['Yes', 'No'],
  PaymentMethod: [
    'Electronic check',
    'Mailed check',
    'Bank transfer (automatic)',
    'Credit card (automatic)',
  ],
};

const INITIAL = {
  tenure: '',
  MonthlyCharges: '',
  TotalCharges: '',
  gender: 'Male',
  Partner: 'No',
  Dependents: 'No',
  PhoneService: 'Yes',
  MultipleLines: 'No',
  InternetService: 'Fiber optic',
  OnlineSecurity: 'No',
  OnlineBackup: 'No',
  DeviceProtection: 'No',
  TechSupport: 'No',
  StreamingTV: 'No',
  StreamingMovies: 'No',
  Contract: 'Month-to-month',
  PaperlessBilling: 'Yes',
  PaymentMethod: 'Electronic check',
};

const inputCls =
  'w-full px-3 py-2 text-sm border border-[#E2E8F0] rounded-lg bg-white text-[#1E293B] focus:outline-none focus:ring-2 focus:ring-[#6366F1] focus:border-transparent transition-shadow';

function Field({ label, children }) {
  return (
    <div>
      <label className="block text-xs font-medium text-[#64748B] mb-1">{label}</label>
      {children}
    </div>
  );
}

function SelectField({ name, value, onChange, options }) {
  return (
    <select name={name} value={value} onChange={onChange} className={inputCls}>
      {options.map((opt) => (
        <option key={opt} value={opt}>
          {opt}
        </option>
      ))}
    </select>
  );
}

function SectionHeader({ title }) {
  return (
    <div className="pt-1 pb-2 border-b border-[#E2E8F0]">
      <h3 className="text-xs font-semibold text-[#64748B] uppercase tracking-wider">
        {title}
      </h3>
    </div>
  );
}

export default function PredictForm({ onResult }) {
  const [form, setForm] = useState(INITIAL);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) =>
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.tenure || !form.MonthlyCharges || !form.TotalCharges) {
      setError('Tenure, Monthly Charges, and Total Charges are required.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const payload = {
        ...form,
        tenure: parseInt(form.tenure, 10),
        MonthlyCharges: parseFloat(form.MonthlyCharges),
        TotalCharges: parseFloat(form.TotalCharges),
      };
      const result = await predictCustomer(payload);
      onResult(result);
    } catch (err) {
      setError(
        err.response?.data?.detail ||
          'Prediction failed. Make sure the API is running on port 8000.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* ── Account info ── */}
      <SectionHeader title="Account info" />
      <div className="grid grid-cols-2 gap-3">
        <Field label="Tenure (months)">
          <input
            type="number"
            name="tenure"
            value={form.tenure}
            onChange={handleChange}
            placeholder="e.g. 24"
            min="0"
            max="72"
            className={inputCls}
          />
        </Field>
        <Field label="Gender">
          <SelectField name="gender" value={form.gender} onChange={handleChange} options={OPTIONS.gender} />
        </Field>
        <Field label="Partner">
          <SelectField name="Partner" value={form.Partner} onChange={handleChange} options={OPTIONS.Partner} />
        </Field>
        <Field label="Dependents">
          <SelectField name="Dependents" value={form.Dependents} onChange={handleChange} options={OPTIONS.Dependents} />
        </Field>
      </div>

      {/* ── Services ── */}
      <SectionHeader title="Services" />
      <div className="grid grid-cols-2 gap-3">
        <Field label="Phone Service">
          <SelectField name="PhoneService" value={form.PhoneService} onChange={handleChange} options={OPTIONS.PhoneService} />
        </Field>
        <Field label="Multiple Lines">
          <SelectField name="MultipleLines" value={form.MultipleLines} onChange={handleChange} options={OPTIONS.MultipleLines} />
        </Field>
        <Field label="Internet Service">
          <SelectField name="InternetService" value={form.InternetService} onChange={handleChange} options={OPTIONS.InternetService} />
        </Field>
        <Field label="Online Security">
          <SelectField name="OnlineSecurity" value={form.OnlineSecurity} onChange={handleChange} options={OPTIONS.OnlineSecurity} />
        </Field>
        <Field label="Online Backup">
          <SelectField name="OnlineBackup" value={form.OnlineBackup} onChange={handleChange} options={OPTIONS.OnlineBackup} />
        </Field>
        <Field label="Device Protection">
          <SelectField name="DeviceProtection" value={form.DeviceProtection} onChange={handleChange} options={OPTIONS.DeviceProtection} />
        </Field>
        <Field label="Tech Support">
          <SelectField name="TechSupport" value={form.TechSupport} onChange={handleChange} options={OPTIONS.TechSupport} />
        </Field>
        <Field label="Streaming TV">
          <SelectField name="StreamingTV" value={form.StreamingTV} onChange={handleChange} options={OPTIONS.StreamingTV} />
        </Field>
        <Field label="Streaming Movies">
          <SelectField name="StreamingMovies" value={form.StreamingMovies} onChange={handleChange} options={OPTIONS.StreamingMovies} />
        </Field>
      </div>

      {/* ── Billing ── */}
      <SectionHeader title="Billing" />
      <div className="grid grid-cols-2 gap-3">
        <Field label="Contract">
          <SelectField name="Contract" value={form.Contract} onChange={handleChange} options={OPTIONS.Contract} />
        </Field>
        <Field label="Paperless Billing">
          <SelectField name="PaperlessBilling" value={form.PaperlessBilling} onChange={handleChange} options={OPTIONS.PaperlessBilling} />
        </Field>
        <Field label="Monthly Charges ($)">
          <input
            type="number"
            name="MonthlyCharges"
            value={form.MonthlyCharges}
            onChange={handleChange}
            placeholder="e.g. 70.70"
            step="0.01"
            className={inputCls}
          />
        </Field>
        <Field label="Total Charges ($)">
          <input
            type="number"
            name="TotalCharges"
            value={form.TotalCharges}
            onChange={handleChange}
            placeholder="e.g. 151.65"
            step="0.01"
            className={inputCls}
          />
        </Field>
        <div className="col-span-2">
          <Field label="Payment Method">
            <SelectField name="PaymentMethod" value={form.PaymentMethod} onChange={handleChange} options={OPTIONS.PaymentMethod} />
          </Field>
        </div>
      </div>

      {error && (
        <p className="text-sm text-[#EF4444] bg-red-50 border border-red-200 rounded-lg px-3 py-2">
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={loading}
        className="w-full py-2.5 px-4 bg-[#6366F1] hover:bg-[#4F46E5] text-white text-sm font-semibold rounded-lg transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
      >
        {loading ? 'Predicting…' : 'Predict churn risk'}
      </button>
    </form>
  );
}
