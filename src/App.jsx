import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ConfigProvider, App as AntdApp } from 'antd';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { CartProvider } from './contexts/CartContext';
import { theme } from './styles/theme';
import ErrorBoundary from './components/common/ErrorBoundary';
import AppLayout from './components/Layout/AppLayout';
import ProtectedRoute from './components/Layout/ProtectedRoute';
import AdminRoute from './components/Layout/AdminRoute';
import Login from './pages/Auth/Login';
import Register from './pages/Auth/Register';
import ProductList from './pages/Products/ProductList';
import Cart from './pages/Cart/Cart';
import OrderCheckout from './pages/Orders/OrderCheckout';
import OrderSuccess from './pages/Orders/OrderSuccess';
import ReportsDashboard from './pages/Reports/ReportsDashboard';

const AppRoutes = () => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <Routes>
      {/* Public routes */}
      <Route path="/login" element={isAuthenticated ? <Navigate to="/products" replace /> : <Login />} />
      <Route path="/register" element={isAuthenticated ? <Navigate to="/products" replace /> : <Register />} />

      {/* Protected routes */}
      <Route
        path="/products"
        element={
          <ProtectedRoute>
            <AppLayout>
              <ProductList />
            </AppLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/cart"
        element={
          <ProtectedRoute>
            <AppLayout>
              <Cart />
            </AppLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/checkout"
        element={
          <ProtectedRoute>
            <AppLayout>
              <OrderCheckout />
            </AppLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/order-success/:orderId"
        element={
          <ProtectedRoute>
            <AppLayout>
              <OrderSuccess />
            </AppLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/reports"
        element={
          <AdminRoute>
            <AppLayout>
              <ReportsDashboard />
            </AppLayout>
          </AdminRoute>
        }
      />

      {/* Default redirect */}
      <Route
        path="/"
        element={<Navigate to={isAuthenticated ? '/products' : '/login'} replace />}
      />
    </Routes>
  );
};

function App() {
  return (
    <ErrorBoundary>
      <ConfigProvider theme={theme}>
        <AntdApp>
          <BrowserRouter>
            <AuthProvider>
              <CartProvider>
                <AppRoutes />
              </CartProvider>
            </AuthProvider>
          </BrowserRouter>
        </AntdApp>
      </ConfigProvider>
    </ErrorBoundary>
  );
}

export default App;
