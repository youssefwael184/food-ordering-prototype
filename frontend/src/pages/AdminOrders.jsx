import { useEffect, useState } from 'react'
import api from '../api/client'
import { useTranslation } from 'react-i18next'
import { RotateCw } from 'lucide-react'

const STATUS_LABEL_KEY = {
  Pending: 'statusPending',
  Confirmed: 'statusConfirmed',
  Preparing: 'statusPreparing',
  OutForDelivery: 'statusOutForDelivery',
  Delivered: 'statusDelivered',
  Cancelled: 'statusCancelled'
}

const STATUS_CLASS = {
  Pending: 'status-pending',
  Confirmed: 'status-confirmed',
  Preparing: 'status-preparing',
  OutForDelivery: 'status-outfordelivery',
  Delivered: 'status-delivered',
  Cancelled: 'status-cancelled'
}

// Define allowed next statuses for each current status
const ALLOWED_NEXT = {
  Pending:        ['Pending', 'Confirmed', 'Cancelled'],
  Confirmed:      ['Confirmed', 'Preparing', 'Cancelled'],
  Preparing:      ['Preparing', 'OutForDelivery', 'Cancelled'],
  OutForDelivery: ['OutForDelivery', 'Delivered'],
  Delivered:      ['Delivered'],
  Cancelled:      ['Cancelled']
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
  const [updating, setUpdating] = useState({})

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
    const targetStatus = status || order?.status

    setUpdating((prev) => ({ ...prev, [id]: true }))
    try {
      await api.put(
        `/api/admin/orders/${id}/status`,
        { status: targetStatus, note: 'Updated by admin' },
        { headers: { 'Content-Type': 'application/json' } }
      )
      await load()
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
      <div className="panel-head">
        <h3>{t('manageOrders')}</h3>
        <button className="ghost-btn" onClick={load} disabled={loading}>
          <RotateCw size={14} /> {loading ? t('loading') : (t('refresh') || 'Refresh')}
        </button>
      </div>

      {loading && orders.length === 0 && (
        <p className="muted" style={{ textAlign: 'center', padding: '2rem 0' }}>
          {t('loading')}
        </p>
      )}

      {!loading && orders.length === 0 && (
        <p className="muted" style={{ textAlign: 'center', padding: '2rem 0' }}>
          {t('noOrders') || 'No orders yet.'}
        </p>
      )}

      {orders.map((o) => {
        const currentStatus = selectedStatus[o.id] ?? o.status
        const isUpdating = updating[o.id]
        const allowedStatuses = ALLOWED_NEXT[o.status] || [o.status]
        const isFinal = o.status === 'Delivered' || o.status === 'Cancelled'

        return (
          <div key={o.id} className="admin-order-row" style={{ opacity: isUpdating ? 0.6 : 1 }}>
            {/* Order info */}
            <div className="grow">
              <strong>{o.orderNumber}</strong>
              <p className="meta-line" style={{ color: 'var(--text)', fontSize: 13 }}>{o.customerName}</p>
              <p className="meta-line">{formatDate(o.createdAtUtc)}</p>
            </div>

            {/* Status badge + total */}
            <div className="admin-order-status">
              <span className={`status-pill ${STATUS_CLASS[o.status] || ''}`}>
                {statusLabel(o.status)}
              </span>
              <strong>{Number(o.total || 0).toFixed(2)} EGP</strong>
            </div>

            {/* Status selector - disabled for final statuses */}
            {isFinal ? (
              <span className="muted" style={{ fontSize: 13 }}>
                {statusLabel(o.status)}
              </span>
            ) : (
              <select
                className="select-status"
                value={currentStatus}
                onChange={(e) =>
                  setSelectedStatus({ ...selectedStatus, [o.id]: e.target.value })
                }
                disabled={isUpdating}
              >
                {allowedStatuses.map((s) => (
                  <option key={s} value={s}>{statusLabel(s)}</option>
                ))}
              </select>
            )}

            {/* Hide save button for final statuses */}
            {!isFinal && (
              <button
                className="primary-btn"
                type="button"
                onClick={() => updateStatus(o.id)}
                disabled={isUpdating}
                style={{ minWidth: 70, justifyContent: 'center' }}
              >
                {isUpdating ? '…' : t('save')}
              </button>
            )}
          </div>
        )
      })}
    </div>
  )
}