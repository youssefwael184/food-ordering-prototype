import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import api from '../api/client'
import { useTranslation } from 'react-i18next'

const STATUS_COLOR = {
  Pending: '#f59e0b',
  Confirmed: '#3b82f6',
  Preparing: '#8b5cf6',
  OutForDelivery: '#06b6d4',
  Delivered: '#22c55e',
  Cancelled: '#ef4444'
}

const STATUS_LABEL_KEY = {
  Pending: 'statusPending',
  Confirmed: 'statusConfirmed',
  Preparing: 'statusPreparing',
  OutForDelivery: 'statusOutForDelivery',
  Delivered: 'statusDelivered',
  Cancelled: 'statusCancelled'
}

function formatDate(iso) {
  if (!iso) return ''
  return new Date(iso).toLocaleDateString(undefined, {
    dateStyle: 'medium'
  })
}

export default function Orders() {
  const { t } = useTranslation()
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    api.get('/api/orders/my')
      .then((res) => setOrders(res.data))
      .catch((err) => setError(err.message || 'Failed to load orders.'))
      .finally(() => setLoading(false))
  }, [])

  const statusLabel = (status) => {
    const key = STATUS_LABEL_KEY[status]
    return key ? t(key) : status
  }

  if (loading) return <div className="page-center">{t('loading')}</div>

  return (
    <section className="stack">
      <h2>{t('myOrders')}</h2>

      {error && <p className="error">{error}</p>}

      {!error && orders.length === 0 && (
        <div className="panel" style={{ textAlign: 'center', padding: '3rem 1rem' }}>
          <p style={{ fontSize: 40, marginBottom: 8 }}>🛍️</p>
          <p style={{ color: 'var(--muted)', marginBottom: 16 }}>
            {t('noOrdersYet') || "You haven't placed any orders yet."}
          </p>
          <Link to="/menu" className="primary-btn">
            {t('browseMenu')}
          </Link>
        </div>
      )}

      {orders.length > 0 && (
        <div className="panel">
          {orders.map((o) => (
            <Link key={o.id} to={`/orders/${o.id}`} className="order-row">
              <div style={{ flex: 1 }}>
                <strong>{o.orderNumber}</strong>
                <p style={{ margin: '2px 0', fontSize: 13, color: 'var(--muted)' }}>
                  {formatDate(o.createdAtUtc)}
                </p>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <span
                  style={{
                    padding: '3px 12px',
                    borderRadius: 99,
                    fontSize: 12,
                    fontWeight: 600,
                    background: (STATUS_COLOR[o.status] || '#888') + '22',
                    color: STATUS_COLOR[o.status] || '#888'
                  }}
                >
                  {statusLabel(o.status)}
                </span>
                <strong>{Number(o.total).toFixed(2)} EGP</strong>
                <span style={{ color: 'var(--muted)' }}>›</span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </section>
  )
}