import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
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

  if (loading) return <div className="page-center">{t('loading')}</div>

  if (error) {
    return (
      <section className="stack">
        <div className="panel" style={{ textAlign: 'center', padding: '3rem 1rem' }}>
          <p style={{ fontSize: 40 }}>😕</p>
          <p className="error">{error}</p>
          <Link to="/orders" className="primary-btn" style={{ marginTop: 16, display: 'inline-block' }}>
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
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
        <Link to="/orders" style={{ color: 'var(--muted)', textDecoration: 'none', fontSize: 14 }}>
          ← {t('myOrders')}
        </Link>
        <h2 style={{ margin: 0 }}>{order.orderNumber}</h2>
        <span
          style={{
            padding: '4px 14px',
            borderRadius: 99,
            fontSize: 13,
            fontWeight: 700,
            background: (STATUS_COLOR[order.status] || '#888') + '22',
            color: STATUS_COLOR[order.status] || '#888'
          }}
        >
          {statusLabel(order.status)}
        </span>
      </div>

      {/* Progress tracker */}
      {!isCancelled && (
        <div className="panel" style={{ padding: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 0, overflowX: 'auto' }}>
            {STATUS_STEPS.map((step, i) => {
              const done = i <= currentStepIndex
              const active = i === currentStepIndex
              return (
                <div key={step} style={{ display: 'flex', alignItems: 'center', flex: i < STATUS_STEPS.length - 1 ? 1 : 0 }}>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                    <div
                      style={{
                        width: 32,
                        height: 32,
                        borderRadius: '50%',
                        background: done ? STATUS_COLOR[step] || '#22c55e' : 'var(--surface)',
                        border: `2px solid ${done ? STATUS_COLOR[step] || '#22c55e' : 'var(--border)'}`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: 14,
                        fontWeight: 700,
                        color: done ? '#fff' : 'var(--muted)',
                        transition: 'all 0.3s',
                        boxShadow: active ? `0 0 0 4px ${(STATUS_COLOR[step] || '#22c55e')}33` : 'none'
                      }}
                    >
                      {done && !active ? '✓' : i + 1}
                    </div>
                    <span style={{ fontSize: 10, color: done ? 'var(--text)' : 'var(--muted)', whiteSpace: 'nowrap', fontWeight: active ? 700 : 400 }}>
                      {statusLabel(step)}
                    </span>
                  </div>
                  {i < STATUS_STEPS.length - 1 && (
                    <div
                      style={{
                        flex: 1,
                        height: 2,
                        background: i < currentStepIndex ? '#22c55e' : 'var(--border)',
                        margin: '0 4px',
                        marginBottom: 20,
                        transition: 'background 0.3s'
                      }}
                    />
                  )}
                </div>
              )
            })}
          </div>
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 16 }}>
        {/* Order items */}
        <div className="panel">
          <h3 style={{ marginTop: 0 }}>{t('orderItems') || 'Items'}</h3>
          {order.items?.map((item) => (
            <div key={item.id} style={{ display: 'flex', gap: 12, alignItems: 'center', padding: '8px 0', borderBottom: '1px solid var(--border)' }}>
              {item.imageUrl && (
                <img
                  src={item.imageUrl}
                  alt={item.itemName}
                  style={{ width: 48, height: 48, objectFit: 'cover', borderRadius: 8 }}
                  onError={(e) => { e.target.style.display = 'none' }}
                />
              )}
              <div style={{ flex: 1 }}>
                <strong style={{ fontSize: 14 }}>{item.itemName}</strong>
                <p style={{ margin: 0, fontSize: 13, color: 'var(--muted)' }}>
                  {Number(item.unitPrice).toFixed(2)} EGP × {item.quantity}
                </p>
              </div>
              <strong style={{ fontSize: 14 }}>{Number(item.lineTotal).toFixed(2)} EGP</strong>
            </div>
          ))}

          <div style={{ paddingTop: 12, borderTop: '2px solid var(--border)', marginTop: 4 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14, color: 'var(--muted)', marginBottom: 4 }}>
              <span>{t('subtotal') || 'Subtotal'}</span>
              <span>{Number(order.subtotal ?? (order.total - 25)).toFixed(2)} EGP</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14, color: 'var(--muted)', marginBottom: 8 }}>
              <span>{t('deliveryFee') || 'Delivery fee'}</span>
              <span>25.00 EGP</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 700, fontSize: 16 }}>
              <span>{t('total')}</span>
              <span>{Number(order.total).toFixed(2)} EGP</span>
            </div>
          </div>
        </div>

        {/* Delivery info */}
        <div className="panel">
          <h3 style={{ marginTop: 0 }}>{t('deliveryInfo') || 'Delivery Info'}</h3>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
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
                  <td style={{ padding: '6px 0', color: 'var(--muted)', width: '40%' }}>{label}</td>
                  <td style={{ padding: '6px 0', fontWeight: 500 }}>{value}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Status history */}
      {order.statusHistory?.length > 0 && (
        <div className="panel">
          <h3 style={{ marginTop: 0 }}>{t('statusHistory') || 'Status History'}</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {order.statusHistory.map((h, i) => (
              <div key={i} style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                <div
                  style={{
                    width: 10,
                    height: 10,
                    borderRadius: '50%',
                    background: STATUS_COLOR[h.status] || '#888',
                    marginTop: 5,
                    flexShrink: 0
                  }}
                />
                <div>
                  <div style={{ fontSize: 14, fontWeight: 600 }}>
                    {statusLabel(h.status)}
                    {h.changedBy && h.changedBy !== 'System' && (
                      <span style={{ color: 'var(--muted)', fontWeight: 400, marginLeft: 6 }}>
                        by {h.changedBy}
                      </span>
                    )}
                  </div>
                  {h.note && <p style={{ margin: '2px 0 0', fontSize: 13, color: 'var(--muted)' }}>{h.note}</p>}
                  <p style={{ margin: '2px 0 0', fontSize: 12, color: 'var(--muted)' }}>
                    {formatDateTime(h.changedAtUtc)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </section>
  )
}