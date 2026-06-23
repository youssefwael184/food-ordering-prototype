import { useEffect, useState } from 'react'
import api from '../api/client'
import { useTranslation } from 'react-i18next'
import { RotateCw, X } from 'lucide-react'

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

const ALLOWED_NEXT = {
  Pending:        ['Confirmed', 'Cancelled'],
  Confirmed:      ['Preparing', 'Cancelled'],
  Preparing:      ['OutForDelivery', 'Cancelled'],
  OutForDelivery: ['Delivered', 'Cancelled'],
  Delivered:      [],
  Cancelled:      []
}

function formatDate(iso) {
  if (!iso) return ''
  return new Date(iso).toLocaleString(undefined, {
    dateStyle: 'medium',
    timeStyle: 'short'
  })
}

function OrderDetailsPanel({ order, onClose, onStatusUpdate, updating, t }) {
  const statusLabel = (status) => {
    const key = STATUS_LABEL_KEY[status]
    return key ? t(key) : status
  }

  const allowedStatuses = ALLOWED_NEXT[order.status] || []
  const isFinal = order.status === 'Delivered' || order.status === 'Cancelled'

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 1000,
      background: 'rgba(0,0,0,0.5)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: 16
    }}>
      <div style={{
        background: 'var(--card)',
        borderRadius: 16,
        width: '100%',
        maxWidth: 560,
        maxHeight: '90vh',
        overflowY: 'auto',
        padding: 24,
        position: 'relative'
      }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <div>
            <h3 style={{ margin: 0, fontFamily: 'var(--font-display)' }}>{order.orderNumber}</h3>
            <p className="muted" style={{ margin: '4px 0 0', fontSize: 13 }}>{formatDate(order.createdAtUtc)}</p>
          </div>
          <button className="ghost-btn" onClick={onClose} style={{ padding: 8 }}>
            <X size={18} />
          </button>
        </div>

        {/* Customer info */}
        <div style={{ background: 'var(--surface)', borderRadius: 10, padding: 14, marginBottom: 16 }}>
          <h4 style={{ margin: '0 0 10px', fontSize: 13, textTransform: 'uppercase', color: 'var(--muted)' }}>
            {t('deliveryInfo') || 'Delivery Info'}
          </h4>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
            <tbody>
              {[
                [t('fullName'), order.customerName],
                [t('phoneNumber'), order.phoneNumber],
                [t('deliveryAddress'), order.deliveryAddress],
                [t('city'), order.city],
                [t('paymentMethod') || 'Payment', order.paymentMethod === 1 || order.paymentMethod === 'CashOnDelivery' ? 'Cash on Delivery' : 'Online Payment'],
                [t('notes'), order.notes || '—']
              ].map(([label, value]) => (
                <tr key={label}>
                  <td style={{ padding: '4px 0', color: 'var(--muted)', width: '40%' }}>{label}</td>
                  <td style={{ padding: '4px 0', fontWeight: 500 }}>{value}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Order items */}
        <div style={{ background: 'var(--surface)', borderRadius: 10, padding: 14, marginBottom: 16 }}>
          <h4 style={{ margin: '0 0 10px', fontSize: 13, textTransform: 'uppercase', color: 'var(--muted)' }}>
            {t('orderItems') || 'Items'}
          </h4>

          {order.items?.length === 0 && (
            <p className="muted" style={{ fontSize: 13 }}>No items found.</p>
          )}

          {order.items?.map((item) => (
            <div key={item.id} style={{
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              padding: '8px 0', borderBottom: '1px solid var(--border)', fontSize: 14
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                {item.imageUrl && (
                  <img
                    src={item.imageUrl}
                    alt={item.itemName}
                    style={{ width: 44, height: 44, borderRadius: 8, objectFit: 'cover' }}
                    onError={(e) => { e.target.style.display = 'none' }}
                  />
                )}
                <div>
                  <strong>{item.itemName}</strong>
                  <p className="muted" style={{ margin: 0, fontSize: 12 }}>
                    {Number(item.unitPrice).toFixed(2)} EGP × {item.quantity}
                  </p>
                </div>
              </div>
              <strong>{Number(item.lineTotal).toFixed(2)} EGP</strong>
            </div>
          ))}

          {/* Totals */}
          <div style={{ marginTop: 12, fontSize: 14 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--muted)', marginBottom: 4 }}>
              <span>{t('deliveryFee') || 'Delivery fee'}</span>
              <span>25.00 EGP</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 700, fontSize: 15 }}>
              <span>{t('total')}</span>
              <span>{Number(order.total).toFixed(2)} EGP</span>
            </div>
          </div>
        </div>

        {/* Current status */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
          <span className="muted" style={{ fontSize: 13 }}>{t('status') || 'Status'}:</span>
          <span className={`status-pill ${STATUS_CLASS[order.status] || ''}`}>
            {statusLabel(order.status)}
          </span>
        </div>

        {/* Action buttons */}
        {!isFinal && (
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            {allowedStatuses.map((s) => (
              <button
                key={s}
                type="button"
                className={s === 'Cancelled' ? 'ghost-btn danger' : 'primary-btn'}
                disabled={updating}
                onClick={() => onStatusUpdate(order.id, s)}
                style={{ flex: 1, justifyContent: 'center', minWidth: 120 }}
              >
                {updating ? '…' : statusLabel(s)}
              </button>
            ))}
          </div>
        )}

        {isFinal && (
          <p className="muted" style={{ textAlign: 'center', fontSize: 13 }}>
            {order.status === 'Delivered' ? '✅ Order completed' : '❌ Order cancelled'}
          </p>
        )}
      </div>
    </div>
  )
}

export default function AdminOrders() {
  const { t } = useTranslation()
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(false)
  const [updating, setUpdating] = useState({})
  const [selectedOrder, setSelectedOrder] = useState(null)

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

  const updateStatus = async (id, status) => {
    setUpdating((prev) => ({ ...prev, [id]: true }))
    try {
      await api.put(
        `/api/admin/orders/${id}/status`,
        { status, note: 'Updated by admin' },
        { headers: { 'Content-Type': 'application/json' } }
      )
      await load()
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

  const openOrder = async (order) => {
    try {
      const res = await api.get(`/api/admin/orders/${order.id}`)
      setSelectedOrder(res.data)
    } catch {
      setSelectedOrder(order)
    }
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
        <p className="muted" style={{ textAlign: 'center', padding: '2rem 0' }}>{t('loading')}</p>
      )}

      {!loading && orders.length === 0 && (
        <p className="muted" style={{ textAlign: 'center', padding: '2rem 0' }}>
          {t('noOrders') || 'No orders yet.'}
        </p>
      )}

      {orders.map((o) => {
        const isUpdating = updating[o.id]
        const isFinal = o.status === 'Delivered' || o.status === 'Cancelled'
        const allowedStatuses = ALLOWED_NEXT[o.status] || []

        return (
          <div key={o.id} className="admin-order-row" style={{ opacity: isUpdating ? 0.6 : 1, flexWrap: 'wrap', gap: 10 }}>
            {/* Order info — clickable */}
            <div className="grow" style={{ cursor: 'pointer' }} onClick={() => openOrder(o)}>
              <strong style={{ color: 'var(--primary)' }}>{o.orderNumber}</strong>
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

            {/* Quick action buttons */}
            {!isFinal && (
              <div style={{ display: 'flex', gap: 6 }}>
                {allowedStatuses.map((s) => (
                  <button
                    key={s}
                    type="button"
                    className={s === 'Cancelled' ? 'ghost-btn danger' : 'primary-btn'}
                    disabled={isUpdating}
                    onClick={() => updateStatus(o.id, s)}
                    style={{ fontSize: 12, padding: '6px 10px', minWidth: 'unset' }}
                  >
                    {isUpdating ? '…' : statusLabel(s)}
                  </button>
                ))}
              </div>
            )}

            {/* View details button */}
            <button
              type="button"
              className="ghost-btn"
              onClick={() => openOrder(o)}
              style={{ fontSize: 12, padding: '6px 10px' }}
            >
              {t('viewDetails') || 'Details'}
            </button>
          </div>
        )
      })}

      {/* Order details modal */}
      {selectedOrder && (
        <OrderDetailsPanel
          order={selectedOrder}
          onClose={() => setSelectedOrder(null)}
          onStatusUpdate={async (id, status) => {
            await updateStatus(id, status)
            try {
              const res = await api.get(`/api/admin/orders/${id}`)
              setSelectedOrder(res.data)
            } catch {
              setSelectedOrder((prev) => ({ ...prev, status }))
            }
          }}
          updating={updating[selectedOrder?.id]}
          t={t}
        />
      )}
    </div>
  )
}