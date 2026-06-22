import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import api from '../api/client'
import { useAuth } from '../context/AuthContext'
import { useCart } from '../context/CartContext'
import { useNavigate, Link } from 'react-router-dom'

const DELIVERY_FEE = 25

export default function Cart() {
  const { t } = useTranslation()
  const { user } = useAuth()
  const { items, updateQuantity, removeItem, total, clearCart } = useCart()
  const navigate = useNavigate()

  const [form, setForm] = useState({
    customerName: user?.fullName || '',
    phoneNumber: user?.phoneNumber || '',
    deliveryAddress: '',
    city: '',
    notes: '',
    paymentMethod: 1 // CashOnDelivery
  })

  const [message, setMessage] = useState('')
  const [saving, setSaving] = useState(false)

  const placeOrder = async (e) => {
    e.preventDefault()
    if (items.length === 0) return

    setSaving(true)
    setMessage('')

    try {
      const payload = {
        customerName: form.customerName,
        phoneNumber: form.phoneNumber,
        deliveryAddress: form.deliveryAddress,
        city: form.city,
        notes: form.notes,
        paymentMethod: Number(form.paymentMethod),
        items: items.map((item) => ({
          menuItemId: item.id,
          quantity: item.quantity
        }))
      }

      const { data } = await api.post('/api/orders', payload)
      clearCart()
      navigate(`/orders/${data.id}`)
    } catch (err) {
      setMessage(err.message || 'Failed to place order. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  if (items.length === 0 && !saving) {
    return (
      <section className="stack">
        <div className="panel" style={{ textAlign: 'center', padding: '3rem 1rem' }}>
          <p style={{ fontSize: 48, marginBottom: 8 }}>🛒</p>
          <h2 style={{ marginTop: 0 }}>{t('cart')}</h2>
          <p style={{ color: 'var(--muted)', marginBottom: 20 }}>
            {t('cartEmpty') || 'Your cart is empty.'}
          </p>
          <Link to="/menu" className="primary-btn">{t('browseMenu')}</Link>
        </div>
      </section>
    )
  }

  return (
    <section className="checkout-layout">
      {/* Cart items */}
      <div className="panel">
        <h2 style={{ marginTop: 0 }}>{t('cart')}</h2>

        {items.map((item) => (
          <div key={item.id} className="cart-row">
            {item.imageUrl && (
              <img
                src={item.imageUrl}
                alt={item.nameEn}
                onError={(e) => { e.target.style.display = 'none' }}
              />
            )}

            <div className="cart-info">
              <h4 style={{ margin: '0 0 4px' }}>{item.nameEn}</h4>
              <p style={{ margin: 0, color: 'var(--muted)', fontSize: 14 }}>
                {Number(item.price).toFixed(2)} EGP each
              </p>

              <div className="qty">
                <button
                  type="button"
                  onClick={() => updateQuantity(item.id, item.quantity - 1)}
                  aria-label="Decrease quantity"
                >
                  −
                </button>
                <span>{item.quantity}</span>
                <button
                  type="button"
                  onClick={() => updateQuantity(item.id, item.quantity + 1)}
                  aria-label="Increase quantity"
                >
                  +
                </button>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 8 }}>
              <strong>{(Number(item.price) * item.quantity).toFixed(2)} EGP</strong>
              <button
                className="ghost-btn danger"
                type="button"
                onClick={() => removeItem(item.id)}
                style={{ fontSize: 12 }}
              >
                {t('remove')}
              </button>
            </div>
          </div>
        ))}

        {/* Totals */}
        <div style={{ marginTop: 16, paddingTop: 16, borderTop: '1px solid var(--border)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14, color: 'var(--muted)', marginBottom: 6 }}>
            <span>{t('subtotal') || 'Subtotal'}</span>
            <span>{total.toFixed(2)} EGP</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14, color: 'var(--muted)', marginBottom: 10 }}>
            <span>{t('deliveryFee') || 'Delivery fee'}</span>
            <span>{DELIVERY_FEE.toFixed(2)} EGP</span>
          </div>
          <div className="total-line">
            <strong>
              {t('total')}: {(total + DELIVERY_FEE).toFixed(2)} EGP
            </strong>
          </div>
        </div>
      </div>

      {/* Checkout form */}
      <form className="panel form-panel" onSubmit={placeOrder}>
        <h3 style={{ marginTop: 0 }}>{t('checkout')}</h3>

        <input
          placeholder={t('fullName')}
          value={form.customerName}
          onChange={(e) => setForm({ ...form, customerName: e.target.value })}
          required
        />

        <input
          placeholder={t('phoneNumber')}
          value={form.phoneNumber}
          onChange={(e) => setForm({ ...form, phoneNumber: e.target.value })}
          required
        />

        <input
          placeholder={t('deliveryAddress')}
          value={form.deliveryAddress}
          onChange={(e) => setForm({ ...form, deliveryAddress: e.target.value })}
          required
        />

        <input
          placeholder={t('city')}
          value={form.city}
          onChange={(e) => setForm({ ...form, city: e.target.value })}
          required
        />

        <textarea
          placeholder={t('notes')}
          value={form.notes}
          onChange={(e) => setForm({ ...form, notes: e.target.value })}
          rows={3}
        />

        <select
          value={form.paymentMethod}
          onChange={(e) => setForm({ ...form, paymentMethod: Number(e.target.value) })}
        >
          <option value={1}>{t('cashOnDelivery')}</option>
          <option value={2}>{t('onlinePayment')}</option>
        </select>

        {/* Online payment notice */}
        {form.paymentMethod === 2 && (
          <p style={{ fontSize: 13, color: 'var(--muted)', background: 'var(--surface)', padding: '10px 14px', borderRadius: 8, margin: 0 }}>
            💳 {t('onlinePaymentNote') || 'You will be redirected to complete payment after placing your order.'}
          </p>
        )}

        {message && <p className="error">{message}</p>}

        <button
          className="primary-btn"
          disabled={saving || items.length === 0}
        >
          {saving ? t('loading') : t('placeOrder')}
        </button>
      </form>
    </section>
  )
}