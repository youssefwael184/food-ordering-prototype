import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import api from '../api/client'
import { useTranslation } from 'react-i18next'
import { ArrowLeft, Check, Frown } from 'lucide-react'

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

// Simple step-based progress tracker
const STATUS_STEPS = ['Pending', 'Confirmed', 'Preparing', 'OutForDelivery', 'Delivered']

function formatDateTime(iso) {
  if (!iso) return ''
  return new Date(iso).toLocaleString(undefined, {
    dateStyle: 'medium',
    timeStyle: 'short'
  })
}

export default function OrderDetail() {
  const { id } = useParams()
  const { t } = useTranslation()
  const [order, setOrder] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    api.get(`/api/orders/${id}`)
      .then((res) => setOrder(res.data))
      .catch((err) => setError(err.message || 'Order not found.'))
      .finally(() => setLoading(false))
  }, [id])

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

  if (error) {
    return (
      <section className="stack">
        <div className="panel empty-state">
          <Frown className="empty-icon" size={40} strokeWidth={1.5} style={{ display: 'inline-block' }} />
          <p className="error">{error}</p>
          <Link to="/orders" className="primary-btn">
            {t('myOrders')}
          </Link>
        </div>
      </section>
    )
  }

  if (!order) return null

  const statusLabel = (status) => {
    const key = STATUS_LABEL_KEY[status]
    return key ? t(key) : status
  }

  const currentStepIndex = STATUS_STEPS.indexOf(order.status)
  const isCancelled = order.status === 'Cancelled'

  return (
    <section className="stack">
      <div className="order-header">
        <Link to="/orders" className="back-link">
          <ArrowLeft size={14} /> {t('myOrders')}
        </Link>
        <h2>{order.orderNumber}</h2>
        <span className={`status-pill ${STATUS_CLASS[order.status] || ''}`}>
          {statusLabel(order.status)}
        </span>
      </div>

      {/* Progress tracker */}
      {!isCancelled && (
        <div className="panel">
          <div className="progress-track">
            {STATUS_STEPS.map((step, i) => {
              const done = i <= currentStepIndex
              const active = i === currentStepIndex
              return (
                <div key={step} className="progress-step">
                  <div className="progress-node">
                    <div className={`progress-dot ${done ? 'done' : ''} ${active ? 'active' : ''}`}>
                      {done && !active ? <Check size={14} /> : i + 1}
                    </div>
                    <span className={`progress-label ${done ? 'done' : ''}`}>
                      {statusLabel(step)}
                    </span>
                  </div>
                  {i < STATUS_STEPS.length - 1 && (
                    <div className={`progress-connector ${i < currentStepIndex ? 'done' : ''}`} />
                  )}
                </div>
              )
            })}
          </div>
        </div>
      )}

      <div className="two-col">
        {/* Order items */}
        <div className="panel">
          <h3 style={{ marginTop: 0, fontFamily: 'var(--font-display)' }}>{t('orderItems') || 'Items'}</h3>
          {order.items?.map((item) => (
            <div key={item.id} className="line-item">
              {item.imageUrl && (
                <img
                  src={item.imageUrl}
                  alt={item.itemName}
                  onError={(e) => { e.target.style.display = 'none' }}
                />
              )}
              <div className="grow">
                <strong style={{ fontSize: 14 }}>{item.itemName}</strong>
                <p className="meta-line">
                  {Number(item.unitPrice).toFixed(2)} EGP × {item.quantity}
                </p>
              </div>
              <strong style={{ fontSize: 14 }}>{Number(item.lineTotal).toFixed(2)} EGP</strong>
            </div>
          ))}

          <div className="totals">
            <div className="totals-row">
              <span>{t('subtotal') || 'Subtotal'}</span>
              <span>{Number(order.subtotal ?? (order.total - 25)).toFixed(2)} EGP</span>
            </div>
            <div className="totals-row">
              <span>{t('deliveryFee') || 'Delivery fee'}</span>
              <span>25.00 EGP</span>
            </div>
            <div className="totals-row grand">
              <span>{t('total')}</span>
              <span>{Number(order.total).toFixed(2)} EGP</span>
            </div>
          </div>
        </div>

        {/* Delivery info */}
        <div className="panel">
          <h3 style={{ marginTop: 0, fontFamily: 'var(--font-display)' }}>{t('deliveryInfo') || 'Delivery Info'}</h3>
          <table className="detail-table">
            <tbody>
              {[
                [t('fullName'), order.customerName],
                [t('phoneNumber'), order.phoneNumber],
                [t('deliveryAddress'), order.deliveryAddress],
                [t('city'), order.city],
                [t('paymentMethod') || 'Payment', order.paymentMethod],
                [t('notes'), order.notes || '—']
              ].map(([label, value]) => (
                <tr key={label}>
                  <td>{label}</td>
                  <td>{value}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Status history */}
      {order.statusHistory?.length > 0 && (
        <div className="panel">
          <h3 style={{ marginTop: 0, fontFamily: 'var(--font-display)' }}>{t('statusHistory') || 'Status History'}</h3>
          <div>
            {order.statusHistory.map((h, i) => (
              <div key={i} className="timeline-item" style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                <span className={`status-dot ${STATUS_CLASS[h.status] || ''}`} style={{ marginTop: 6 }} />
                <div>
                  <div style={{ fontSize: 14, fontWeight: 600 }}>
                    {statusLabel(h.status)}
                    {h.changedBy && h.changedBy !== 'System' && (
                      <span className="muted" style={{ fontWeight: 400, marginLeft: 6 }}>
                        by {h.changedBy}
                      </span>
                    )}
                  </div>
                  {h.note && <p className="meta-line">{h.note}</p>}
                  <p className="meta-line">{formatDateTime(h.changedAtUtc)}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </section>
  )
}