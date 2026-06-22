import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './context/AuthContext'
import Layout from './components/Layout'
import ProtectedRoute from './components/ProtectedRoute'
import AdminRoute from './components/AdminRoute'
import Home from './pages/Home'
import Menu from './pages/Menu'
import Cart from './pages/Cart'
import Login from './pages/Login'
import Register from './pages/Register'
import Orders from './pages/Orders'
import OrderDetails from './pages/OrderDetails'
import AdminDashboard from './pages/AdminDashboard'
import AdminMenuItems from './pages/AdminMenuItems'
import AdminOrders from './pages/AdminOrders'
import NotFound from './pages/NotFound'

function UserOnlyRoute({ children }) {
  const { user, loading } = useAuth()
  if (loading) return null
  if (user?.role?.toLowerCase() === 'admin') return <Navigate to="/admin" replace />
  return <ProtectedRoute>{children}</ProtectedRoute>
}

export default function App() {
  return (
    <Layout>
      <Routes>
        {/* Public */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* User only */}
        <Route path="/" element={<UserOnlyRoute><Home /></UserOnlyRoute>} />
        <Route path="/menu" element={<UserOnlyRoute><Menu /></UserOnlyRoute>} />
        <Route path="/cart" element={<UserOnlyRoute><Cart /></UserOnlyRoute>} />
        <Route path="/orders" element={<UserOnlyRoute><Orders /></UserOnlyRoute>} />
        <Route path="/orders/:id" element={<UserOnlyRoute><OrderDetails /></UserOnlyRoute>} />

        {/* Admin only */}
        <Route path="/admin" element={<AdminRoute><AdminDashboard /></AdminRoute>}>
          <Route path="menu" element={<AdminMenuItems />} />
          <Route path="orders" element={<AdminOrders />} />
        </Route>

        <Route path="*" element={<NotFound />} />
      </Routes>
    </Layout>
  )
}