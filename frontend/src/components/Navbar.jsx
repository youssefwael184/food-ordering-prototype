import { Link, NavLink } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { ShoppingCart, ChefHat, LayoutDashboard, LogIn, LogOut } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { useCart } from '../context/CartContext'
import LanguageSwitcher from './LanguageSwitcher'

export default function Navbar() {
  const { t } = useTranslation()
  const { user, logout } = useAuth()
  const { items } = useCart()

  return (
    <header className="navbar">
      <Link to="/" className="brand"><ChefHat size={22} /> {t('appName')}</Link>
      <nav className="nav-links">
        <NavLink to="/menu" className={({ isActive }) => isActive ? "active" : ""}>{t('menu')}</NavLink>
        {user && <NavLink to="/orders" className={({ isActive }) => isActive ? "active" : ""}>{t('orders')}</NavLink>}
        {user?.role === 'Admin' && <NavLink to="/admin" className={({ isActive }) => isActive ? "active" : ""}><LayoutDashboard size={16} /> {t('admin')}</NavLink>}
      </nav>
      <div className="nav-actions">
        <LanguageSwitcher />
        <Link to="/cart" className="cart-btn"><ShoppingCart size={16} /> {t('cart')} <span>{items.length}</span></Link>
        {user ? (
          <button className="ghost-btn" onClick={logout}><LogOut size={16} /> {t('logout')}</button>
        ) : (
          <div className="auth-links">
            <Link to="/login" className="ghost-btn"><LogIn size={16} /> {t('login')}</Link>
            <Link to="/register" className="primary-btn">{t('register')}</Link>
          </div>
        )}
      </div>
    </header>
  )
}
