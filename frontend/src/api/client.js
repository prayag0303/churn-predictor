import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

const client = axios.create({
  baseURL: API_URL,
});

//const api = axios.create({ baseURL: 'http://localhost:8000' });

export const getCustomers = (filters = {}) => {
  const params = {};
  if (filters.risk_tier) params.risk_tier = filters.risk_tier;
  if (filters.contract) params.contract = filters.contract;
  if (filters.min_charges != null && filters.min_charges !== '')
    params.min_charges = parseFloat(filters.min_charges);
  if (filters.max_charges != null && filters.max_charges !== '')
    params.max_charges = parseFloat(filters.max_charges);
  return client.get('/customers', { params }).then((r) => r.data);
};

export const getCustomer = (id) =>
  client.get(`/customers/${id}`).then((r) => r.data);

export const predictCustomer = (data) =>
  client.post('/predict', data).then((r) => r.data);

export default client;
