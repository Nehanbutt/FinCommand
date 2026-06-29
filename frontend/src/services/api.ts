import axios from 'axios';

const API = axios.create({ baseURL: 'http://127.0.0.1:8000' });

API.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

API.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

// Auth
export const register = (email: string, password: string) =>
  API.post('/auth/register', { email, password });
export const login = (email: string, password: string) =>
  API.post('/auth/login', { email, password });
export const getMe = () => API.get('/auth/me');

// Company
export const setupCompany = (data: any) => API.post('/company/setup', data);
export const getCompany = () => API.get('/company/');
export const updateCompany = (data: any) => API.put('/company/', data);

// Employees
export const getEmployees = () => API.get('/employees/');
export const addEmployee = (data: any) => API.post('/employees/', data);
export const updateEmployee = (id: number, data: any) => API.put(`/employees/${id}`, data);
export const deleteEmployee = (id: number) => API.delete(`/employees/${id}`);
export const importCSV = (file: File) => {
  const form = new FormData();
  form.append('file', file);
  return API.post('/employees/import-csv', form);
};

// Analytics
export const getDashboard = () => API.get('/analytics/dashboard');
export const getEmployeeIntelligence = () => API.get('/analytics/employees/intelligence');
export const getForecast = (months: number) => API.post('/analytics/forecast', { months });
export const runScenario = (params: any) => API.post('/analytics/scenario', params);

export default API;
