import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import api from '../api/client'
import { useTranslation } from 'react-i18next'
import { ShoppingBag, ChevronRight } from 'lucide-react'

const STATUS_CLASS = {
  Pending: 'status-pending',
  Confirmed: 'status-confirmed',
  Preparing: 'status-preparing',
  OutForDelivery: 'status-outfordelivery',
  Delivered: 'status-delivered',
  Cancelled: 'status-cancelled'
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

  if (loading) {
    return (
      <div className="page-center">
        <div className="loading-state">
          <span className="spinner" aria-hidden="true" />
          <span className="muted">{t('loading')}</span>
        </div>
      </div>
    )
  }

  return (
    <section className="stack">
      <h2 style={{ fontFamily: 'var(--font-display)' }}>{t('myOrders')}</h2>

      {error && <p className="error">{error}</p>}

      {!error && orders.length === 0 && (
        <div className="panel empty-state">
          <ShoppingBag className="empty-icon" size={44} strokeWidth={1.5} style={{ display: 'inline-block' }} />
          <p>{t('noOrdersYet') || "You haven't placed any orders yet."}</p>
          <Link to="/menu" className="primary-btn">
            {t('browseMenu')}
          </Link>
        </div>
      )}

      {orders.length > 0 && (
        <div className="panel">
          {orders.map((o) => (
            <Link key={o.id} to={`/orders/${o.id}`} className="order-row">
              <div className="grow">
                <strong>{o.orderNumber}</strong>
                <p className="meta-line">{formatDate(o.createdAtUtc)}</p>
              </div>

              <div className="order-row-right">
                <span className={`status-pill ${STATUS_CLASS[o.status] || ''}`}>
                  {statusLabel(o.status)}
                </span>
                <strong>{Number(o.total).toFixed(2)} EGP</strong>
                <ChevronRight size={18} className="chevron" />
              </div>
            </Link>
          ))}
        </div>
      )}
    </section>
  )
}