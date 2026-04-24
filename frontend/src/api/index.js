import api from './axios';

export const authAPI = {
  login: (data) => api.post('/auth/login', data),
  me: () => api.get('/auth/me'),
  changePassword: (data) => api.put('/auth/change-password', data),
  apply: (data) => api.post('/auth/apply', data),
};

export const superAdminAPI = {
  getDashboard: () => api.get('/superadmin/dashboard'),
  // Arizalar
  getApplications: (p) => api.get('/superadmin/applications', { params: p }),
  getApplicationStats: () => api.get('/superadmin/applications/stats'),
  approveApplication: (id) => api.patch(`/superadmin/applications/${id}/approve`),
  rejectApplication: (id, data) => api.patch(`/superadmin/applications/${id}/reject`, data),
  // Filiallar
  getBranches: (p) => api.get('/superadmin/branches', { params: p }),
  createBranch: (d) => api.post('/superadmin/branches', d),
  updateBranch: (id, d) => api.put(`/superadmin/branches/${id}`, d),
  deleteBranch: (id) => api.delete(`/superadmin/branches/${id}`),
  // Foydalanuvchilar
  getUsers: (p) => api.get('/superadmin/users', { params: p }),
  createUser: (d) => api.post('/superadmin/users', d),
  updateUser: (id, d) => api.put(`/superadmin/users/${id}`, d),
  toggleUser: (id) => api.patch(`/superadmin/users/${id}/toggle`),
  resetPassword: (id, d) => api.patch(`/superadmin/users/${id}/reset-password`, d),
};

export const adminAPI = {
  getStaff: (p) => api.get('/admin/staff', { params: p }),
  getBranches: () => api.get('/admin/branches-list'),
  createStaff: (d) => api.post('/admin/staff', d),
  updateStaff: (id, d) => api.put(`/admin/staff/${id}`, d),
  toggleStaff: (id) => api.patch(`/admin/staff/${id}/toggle`),
  resetStaffPassword: (id, d) => api.patch(`/admin/staff/${id}/reset-password`, d),
  getNavSettings: () => api.get('/admin/nav-settings'),
  updateNavSettings: (d) => api.put('/admin/nav-settings', d),
  // Filiallar
  getBranches: () => api.get('/admin/branches'),
  createBranch: (d) => api.post('/admin/branches', d),
  updateBranch: (id, d) => api.put(`/admin/branches/${id}`, d),
  deleteBranch: (id) => api.delete(`/admin/branches/${id}`),
};

export const orderAPI = {
  getAll: (p) => api.get('/erp/orders', { params: p }),
  getOne: (id) => api.get(`/erp/orders/${id}`),
  create: (d) => api.post('/erp/orders', d),
  updateStatus: (id, d) => api.patch(`/erp/orders/${id}/status`, d),
};

export const productAPI = {
  getAll: (p) => api.get('/erp/products', { params: p }),
  create: (formData) => api.post('/erp/products', formData),
  update: (id, formData) => api.put(`/erp/products/${id}`, formData),
  delete: (id) => api.delete(`/erp/products/${id}`),
  getCategories: () => api.get('/erp/categories'),
  createCategory: (d) => api.post('/erp/categories', d),
};

export const inventoryAPI = {
  getAll: (p) => api.get('/erp/inventory', { params: p }),
  create: (d) => api.post('/erp/inventory', d),
  update: (id, d) => api.put(`/erp/inventory/${id}`, d),
  addStock: (id, d) => api.patch(`/erp/inventory/${id}/stock`, d),
};

export const expenseAPI = {
  getAll: (p) => api.get('/erp/expenses', { params: p }),
  create: (d) => api.post('/erp/expenses', d),
  update: (id, d) => api.put(`/erp/expenses/${id}`, d),
  delete: (id) => api.delete(`/erp/expenses/${id}`),
};

export const customerAPI = {
  getAll: (p) => api.get('/erp/customers', { params: p }),
  getOne: (id) => api.get(`/erp/customers/${id}`),
  create: (d) => api.post('/erp/customers', d),
  findByPhone: (phone) => api.get(`/erp/customers/phone/${phone}`),
};

export const reportAPI = {
  getSales: (p) => api.get('/erp/reports/sales', { params: p }),
  getProfit: (p) => api.get('/erp/reports/profit', { params: p }),
  getBranchComparison: (p) => api.get('/erp/reports/branches', { params: p }),
};
