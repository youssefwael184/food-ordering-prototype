import { useEffect, useState } from 'react'
import api from '../api/client'
import { useTranslation } from 'react-i18next'
import { Link, Outlet } from 'react-router-dom'

export default function AdminDashboard() {
  const { t } = useTranslation()
  const [summary, setSummary] = useState(null)

  useEffect(() => {
    api.get('/api/admin/dashboard')
      .then((res) => setSummary(res.data))
      .catch((err) => console.error(err))
  }, [])

  return (
    <section className="stack">
      <div className="section-head">
        <h2>{t('adminDashboard')}</h2>

        <div className="filters">
          <Link to="/admin/menu" className="primary-btn">
            {t('manageMenu')}
          </Link>
          <Link to="/admin/orders" className="primary-btn">
            {t('manageOrders')}
          </Link>
        </div>
      </div>

      {summary && (
        <div className="stats-grid">
          <div className="stat-card">
            <span>{t('salesOverview')}</span>
            <strong>{Number(summary.totalSales || 0).toFixed(2)} EGP</strong>
          </div>

          <div className="stat-card">
            <span>{t('orders')}</span>
            <strong>{summary.ordersCount}</strong>
          </div>

          <div className="stat-card">
            <span>{t('menu')}</span>
            <strong>{summary.menuItemsCount}</strong>
          </div>

          <div className="stat-card">
            <span>{t('users')}</span>
            <strong>{summary.usersCount}</strong>
          </div>
        </div>
      )}

      <Outlet />
    </section>
  )
}