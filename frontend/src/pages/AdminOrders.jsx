import { useEffect, useState } from 'react'
import api from '../api/client'
import { useTranslation } from 'react-i18next'

const STATUS_OPTIONS = [
  'Pending',
  'Confirmed',
  'Preparing',
  'OutForDelivery',
  'Delivered',
  'Cancelled'
]

// Map raw enum string → readable label key
const STATUS_LABEL_KEY = {
  Pending: 'statusPending',
  Confirmed: 'statusConfirmed',
  Preparing: 'statusPreparing',
  OutForDelivery: 'statusOutForDelivery',
  Delivered: 'statusDelivered',
  Cancelled: 'statusCancelled'
}

const STATUS_COLOR = {
  Pending: '#f59e0b',
  Confirmed: '#3b82f6',
  Preparing: '#8b5cf6',
  OutForDelivery: '#06b6d4',
  Delivered: '#22c55e',
  Cancelled: '#ef4444'
}

function formatDate(iso) {
  if (!iso) return ''
  return new Date(iso).toLocaleString(undefined, {
    dateStyle: 'medium',
    timeStyle: 'short'
  })
}

export default function AdminOrders() {
  const { t } = useTranslation()
  const [orders, setOrders] = useState([])
  const [selectedStatus, setSelectedStatus] = useState({})
  const [loading, setLoading] = useState(false)
  const [updating, setUpdating] = useState({}) // per-order loading state

  const load = async () => {
    try {
      setLoading(true)
      const res = await api.get('/api/admin/orders')
      setOrders(res.data)
    } catch (err) {
      console.error('Failed to load orders:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  const updateStatus = async (id) => {
    const status = selectedStatus[id]
    const order = orders.find((o) => o.id === id)

    // If dropdown hasn't changed from current, still allow save
    const targetStatus = status || order?.status || 'Confirmed'

    setUpdating((prev) => ({ ...prev, [id]: true }))
    try {
      await api.put(
        `/api/admin/orders/${id}/status`,
        { status: targetStatus, note: 'Updated by admin' },
        { headers: { 'Content-Type': 'application/json' } }
      )
      await load()
      // Clear local selection for this order after successful update
      setSelectedStatus((prev) => {
        const next = { ...prev }
        delete next[id]
        return next
      })
    } catch (err) {
      console.error('Failed to update status:', err)
      alert(err.message || 'Failed to update order status')
    } finally {
      setUpdating((prev) => ({ ...prev, [id]: false }))
    }
  }

  const statusLabel = (status) => {
    const key = STATUS_LABEL_KEY[status]
    return key ? t(key) : status
  }

  return (
    <div className="panel">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <h3 style={{ margin: 0 }}>{t('manageOrders')}</h3>
        <button className="ghost-btn" onClick={load} disabled={loading}>
          {loading ? t('loading') : '↻ ' + (t('refresh') || 'Refresh')}
        </button>
      </div>

      {loading && orders.length === 0 && (
        <p style={{ textAlign: 'center', padding: '2rem 0', color: 'var(--muted)' }}>
          {t('loading')}
        </p>
      )}

      {!loading && orders.length === 0 && (
        <p style={{ textAlign: 'center', padding: '2rem 0', color: 'var(--muted)' }}>
          {t('noOrders') || 'No orders yet.'}
        </p>
      )}

      {orders.map((o) => {
        const currentStatus = selectedStatus[o.id] ?? o.status
        const isUpdating = updating[o.id]

        return (
          <div key={o.id} className="admin-order-row" style={{ opacity: isUpdating ? 0.6 : 1 }}>
            {/* Order info */}
            <div style={{ flex: 1 }}>
              <strong>{o.orderNumber}</strong>
              <p style={{ margin: '2px 0', fontSize: 13 }}>{o.customerName}</p>
              <p style={{ margin: 0, fontSize: 12, color: 'var(--muted)' }}>
                {formatDate(o.createdAtUtc)}
              </p>
            </div>

            {/* Status badge + total */}
            <div style={{ textAlign: 'right', minWidth: 120 }}>
              <span
                style={{
                  display: 'inline-block',
                  padding: '2px 10px',
                  borderRadius: 99,
                  fontSize: 12,
                  fontWeight: 600,
                  background: (STATUS_COLOR[o.status] || '#888') + '22',
                  color: STATUS_COLOR[o.status] || '#888',
                  marginBottom: 4
                }}
              >
                {statusLabel(o.status)}
              </span>
              <p style={{ margin: 0, fontWeight: 700 }}>
                {Number(o.total || 0).toFixed(2)} EGP
              </p>
            </div>

            {/* Status selector */}
            <select
              value={currentStatus}
              onChange={(e) =>
                setSelectedStatus({ ...selectedStatus, [o.id]: e.target.value })
              }
              disabled={isUpdating}
              style={{ minWidth: 150 }}
            >
              {STATUS_OPTIONS.map((s) => (
                <option key={s} value={s}>{statusLabel(s)}</option>
              ))}
            </select>

            <button
              className="primary-btn"
              type="button"
              onClick={() => updateStatus(o.id)}
              disabled={isUpdating}
              style={{ minWidth: 70 }}
            >
              {isUpdating ? '…' : t('save')}
            </button>
          </div>
        )
      })}
    </div>
  )
}