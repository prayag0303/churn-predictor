import axios from 'axios';

const api = axios.create({ baseURL: 'http://localhost:8000' });

export const getCustomers = (filters = {}) => {
  const params = {};
  if (filters.risk_tier) params.risk_tier = filters.risk_tier;
  if (filters.contract) params.contract = filters.contract;
  if (filters.min_charges != null && filters.min_charges !== '')
    params.min_charges = parseFloat(filters.min_charges);
  if (filters.max_charges != null && filters.max_charges !== '')
    params.max_charges = parseFloat(filters.max_charges);
  return api.get('/customers', { params }).then((r) => r.data);
};

export const getCustomer = (id) =>
  api.get(`/customers/${id}`).then((r) => r.data);

export const predictCustomer = (data) =>
  api.post('/predict', data).then((r) => r.data);
