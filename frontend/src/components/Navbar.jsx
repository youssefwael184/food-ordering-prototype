import { useEffect, useState } from 'react'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { ShoppingCart, ChefHat, LayoutDashboard, LogIn, LogOut, Menu, X } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { useCart } from '../context/CartContext'
import LanguageSwitcher from './LanguageSwitcher'

export default function Navbar() {
  const { t } = useTranslation()
  const { user, logout } = useAuth()
  const { items } = useCart()
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const navigate = useNavigate()

  const isAdmin = user?.role?.toLowerCase() === 'admin'

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8)
    onScroll()
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const closeMenu = () => setMenuOpen(false)

  const handleLogout = () => {
    logout()
    closeMenu()
    navigate('/login')
  }

  return (
    <header className={`navbar ${scrolled ? 'is-scrolled' : ''}`}>
      <Link to={isAdmin ? '/admin' : '/'} className="brand" onClick={closeMenu}>
        <span className="brand-mark"><ChefHat size={19} /></span>
        {t('appName')}
      </Link>

      <button
        className="nav-toggle"
        onClick={() => setMenuOpen((open) => !open)}
        aria-label="Toggle menu"
        aria-expanded={menuOpen}
      >
        {menuOpen ? <X size={20} /> : <Menu size={20} />}
      </button>

      <nav className={`nav-links ${menuOpen ? 'open' : ''}`}>
        {/* User only links */}
        {!isAdmin && (
          <>
            <NavLink to="/menu" onClick={closeMenu} className={({ isActive }) => isActive ? 'active' : ''}>{t('menu')}</NavLink>
            {user && <NavLink to="/orders" onClick={closeMenu} className={({ isActive }) => isActive ? 'active' : ''}>{t('orders')}</NavLink>}
          </>
        )}

        {/* Admin only links */}
        {isAdmin && (
          <>
            <NavLink to="/admin/menu" onClick={closeMenu} className={({ isActive }) => isActive ? 'active' : ''}>
              <LayoutDashboard size={16} /> {t('manageMenu')}
            </NavLink>
            <NavLink to="/admin/orders" onClick={closeMenu} className={({ isActive }) => isActive ? 'active' : ''}>
              {t('manageOrders')}
            </NavLink>
          </>
        )}
      </nav>

      <div className={`nav-actions ${menuOpen ? 'open' : ''}`}>
        <LanguageSwitcher />

        {/* Hide cart from admin */}
        {!isAdmin && (
          <Link to="/cart" className="cart-btn" onClick={closeMenu}>
            <ShoppingCart size={16} /> {t('cart')}
            <span className="cart-count">{items.length}</span>
          </Link>
        )}

        {user ? (
          <button className="ghost-btn" onClick={handleLogout}><LogOut size={16} /> {t('logout')}</button>
        ) : (
          <div className="auth-links">
            <Link to="/login" className="ghost-btn" onClick={closeMenu}><LogIn size={16} /> {t('login')}</Link>
            <Link to="/register" className="primary-btn" onClick={closeMenu}>{t('register')}</Link>
          </div>
        )}
      </div>
    </header>
  )
}