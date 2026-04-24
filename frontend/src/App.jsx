import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Layout from './components/layout/Layout';

const LoginPage         = lazy(() => import('./pages/auth/LoginPage'));
const SuperDashboard    = lazy(() => import('./pages/superadmin/SuperDashboard'));
const ApplicationsPage  = lazy(() => import('./pages/superadmin/ApplicationsPage'));
const BranchesPage      = lazy(() => import('./pages/superadmin/BranchesPage'));
const UsersPage         = lazy(() => import('./pages/superadmin/UsersPage'));
const AdminDashboard    = lazy(() => import('./pages/admin/AdminDashboard'));
const AdminBranchesPage  = lazy(() => import('./pages/admin/AdminBranchesPage'));
const AdminStaffPage     = lazy(() => import('./pages/admin/AdminStaffPage'));
const NavSettingsPage    = lazy(() => import('./pages/admin/NavSettingsPage'));
const ERPDashboard      = lazy(() => import('./pages/erp/ERPDashboard'));
const POSPage           = lazy(() => import('./pages/erp/pos/POSPage'));
const OrdersPage        = lazy(() => import('./pages/erp/orders/OrdersPage'));
const ProductsPage      = lazy(() => import('./pages/erp/products/ProductsPage'));
const InventoryPage     = lazy(() => import('./pages/erp/inventory/InventoryPage'));
const ExpensesPage      = lazy(() => import('./pages/erp/expenses/ExpensesPage'));
const CustomersPage     = lazy(() => import('./pages/erp/customers/CustomersPage'));
const ReportsPage       = lazy(() => import('./pages/erp/reports/ReportsPage'));
const MonitorPage       = lazy(() => import('./pages/erp/monitor/MonitorPage'));

const Loader = () => (
  <div className="flex items-center justify-center h-full min-h-screen">
    <div className="text-center">
      <div className="w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
      <p className="text-gray-400 text-sm font-medium">Yuklanmoqda...</p>
    </div>
  </div>
);

const ProtectedRoute = ({ children, roles }) => {
  const { user, loading } = useAuth();
  if (loading) return <Loader />;
  if (!user) return <Navigate to="/login" replace />;
  if (roles && !roles.includes(user.role)) {
    return <Navigate to={user.role === 'superadmin' ? '/superadmin' : user.role === 'director' ? '/admin' : '/erp'} replace />;
  }
  return children;
};

function AppRoutes() {
  const { user } = useAuth();
  const home = !user ? '/login' : user.role === 'superadmin' ? '/superadmin' : user.role === 'director' ? '/admin' : '/erp';

  return (
    <Suspense fallback={<Loader />}>
      <Routes>
        <Route path="/login" element={user ? <Navigate to={home} replace /> : <LoginPage />} />

        {/* Super Admin */}
        <Route path="/superadmin" element={<ProtectedRoute roles={['superadmin']}><Layout /></ProtectedRoute>}>
          <Route index element={<SuperDashboard />} />
          <Route path="applications" element={<ApplicationsPage />} />
          <Route path="branches" element={<BranchesPage />} />
          <Route path="users" element={<UsersPage />} />
        </Route>

        {/* Director Admin */}
        <Route path="/admin" element={<ProtectedRoute roles={['superadmin', 'director']}><Layout /></ProtectedRoute>}>
          <Route index element={<AdminDashboard />} />
          <Route path="branches" element={<AdminBranchesPage />} />
          <Route path="staff" element={<AdminStaffPage />} />
          <Route path="nav-settings" element={<NavSettingsPage />} />
          <Route path="expenses" element={<ExpensesPage />} />
          <Route path="reports" element={<ReportsPage />} />
        </Route>

        {/* ERP */}
        <Route path="/erp" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
          <Route index element={<ERPDashboard />} />
          <Route path="pos" element={<POSPage />} />
          <Route path="orders" element={<OrdersPage />} />
          <Route path="products" element={<ProductsPage />} />
          <Route path="inventory" element={<InventoryPage />} />
          <Route path="expenses" element={<ExpensesPage />} />
          <Route path="customers" element={<CustomersPage />} />
          <Route path="reports" element={<ReportsPage />} />
          <Route path="monitor" element={<MonitorPage />} />
        </Route>

        <Route path="/" element={<Navigate to={home} replace />} />
        <Route path="*" element={<Navigate to={home} replace />} />
      </Routes>
    </Suspense>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Toaster position="top-right" toastOptions={{
          duration: 3500,
          style: { borderRadius: '14px', fontSize: '14px', fontWeight: '500', boxShadow: '0 10px 40px rgba(0,0,0,0.12)' },
        }} />
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}
