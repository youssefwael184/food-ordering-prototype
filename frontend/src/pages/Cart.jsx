import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import api from '../api/client'
import { useAuth } from '../context/AuthContext'
import { useCart } from '../context/CartContext'
import { useNavigate, Link } from 'react-router-dom'
import { CreditCard, Banknote, Lock } from 'lucide-react'

const DELIVERY_FEE = 25

function CardForm({ total, onSuccess, onCancel }) {
  const { t } = useTranslation()
  const [card, setCard] = useState({ number: '', name: '', expiry: '', cvv: '' })
  const [processing, setProcessing] = useState(false)
  const [done, setDone] = useState(false)

  const formatCardNumber = (val) =>
    val.replace(/\D/g, '').slice(0, 16).replace(/(.{4})/g, '$1 ').trim()

  const formatExpiry = (val) => {
    const clean = val.replace(/\D/g, '').slice(0, 4)
    return clean.length >= 3 ? `${clean.slice(0, 2)}/${clean.slice(2)}` : clean
  }

  const handlePay = (e) => {
    e.preventDefault()
    setProcessing(true)
    setTimeout(() => {
      setDone(true)
      setTimeout(() => onSuccess(), 1500)
    }, 2000)
  }

  if (done) {
    return (
      <div style={{ textAlign: 'center', padding: '2rem 0' }}>
        <div style={{ fontSize: 48 }}>✅</div>
        <h3 style={{ color: 'var(--primary)' }}>{t('paymentSuccess') || 'Payment Successful!'}</h3>
        <p className="muted">{t('placingOrder') || 'Placing your order...'}</p>
      </div>
    )
  }

  return (
    <div style={{ marginTop: 16, padding: 16, background: 'var(--surface)', borderRadius: 12, border: '1px solid var(--border)' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
        <Lock size={14} style={{ color: 'var(--primary)' }} />
        <span style={{ fontSize: 13, fontWeight: 600 }}>{t('securePayment') || 'Secure Payment'}</span>
        <span className="muted" style={{ fontSize: 12, marginLeft: 'auto' }}>💳 Visa / Mastercard</span>
      </div>

      <form onSubmit={handlePay} style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        <input
          placeholder={t('cardNumber') || 'Card Number (16 digits)'}
          value={card.number}
          onChange={(e) => setCard({ ...card, number: formatCardNumber(e.target.value) })}
          maxLength={19}
          required
        />
        <input
          placeholder={t('cardName') || 'Name on Card'}
          value={card.name}
          onChange={(e) => setCard({ ...card, name: e.target.value })}
          required
        />
        <div style={{ display: 'flex', gap: 10 }}>
          <input
            placeholder={t('expiry') || 'MM/YY'}
            value={card.expiry}
            onChange={(e) => setCard({ ...card, expiry: formatExpiry(e.target.value) })}
            maxLength={5}
            required
            style={{ flex: 1 }}
          />
          <input
            placeholder={t('cvv') || 'CVV'}
            value={card.cvv}
            onChange={(e) => setCard({ ...card, cvv: e.target.value.replace(/\D/g, '').slice(0, 3) })}
            maxLength={3}
            required
            style={{ flex: 1 }}
          />
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderTop: '1px solid var(--border)', marginTop: 4 }}>
          <span className="muted">{t('total')}</span>
          <strong>{total.toFixed(2)} EGP</strong>
        </div>

        <button className="primary-btn" disabled={processing} type="submit">
          {processing ? (
            <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span className="spinner" aria-hidden="true" style={{ width: 14, height: 14 }} />
              {t('processing') || 'Processing...'}
            </span>
          ) : (
            <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <CreditCard size={15} /> {t('payNow') || `Pay ${total.toFixed(2)} EGP`}
            </span>
          )}
        </button>

        <button type="button" className="ghost-btn" onClick={onCancel} disabled={processing}>
          {t('cancel') || 'Cancel'}
        </button>
      </form>
    </div>
  )
}

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
    paymentMethod: 1
  })

  const [message, setMessage] = useState('')
  const [saving, setSaving] = useState(false)
  const [showCardForm, setShowCardForm] = useState(false)
  const [savedItems, setSavedItems] = useState([])

  const submitOrder = async (orderItems) => {
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
        items: orderItems.map((item) => ({
          menuItemId: item.id,
          quantity: item.quantity
        }))
      }
      const { data } = await api.post('/api/orders', payload)
      clearCart()
      navigate(`/orders/${data.id}`)
    } catch (err) {
      setMessage(err.message || 'Failed to place order. Please try again.')
      setShowCardForm(false)
      setSaving(false)
    }
  }

  const placeOrder = async () => {
    if (items.length === 0) return

    if (!form.customerName || !form.phoneNumber || !form.deliveryAddress || !form.city) {
      setMessage(t('fillAllFields') || 'Please fill all required fields.')
      return
    }

    setMessage('')

    if (form.paymentMethod === 2) {
      setSavedItems([...items])
      setShowCardForm(true)
      return
    }

    await submitOrder([...items])
  }

  if (items.length === 0 && !saving && !showCardForm) {
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
                <button type="button" onClick={() => updateQuantity(item.id, item.quantity - 1)} aria-label="Decrease quantity">−</button>
                <span>{item.quantity}</span>
                <button type="button" onClick={() => updateQuantity(item.id, item.quantity + 1)} aria-label="Increase quantity">+</button>
              </div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 8 }}>
              <strong>{(Number(item.price) * item.quantity).toFixed(2)} EGP</strong>
              <button className="ghost-btn danger" type="button" onClick={() => removeItem(item.id)} style={{ fontSize: 12 }}>
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
            <strong>{t('total')}: {(total + DELIVERY_FEE).toFixed(2)} EGP</strong>
          </div>
        </div>
      </div>

      {/* Checkout — now a div, not a form */}
      <div className="panel form-panel">
        <h3 style={{ marginTop: 0 }}>{t('checkout')}</h3>

        <input
          placeholder={t('fullName')}
          value={form.customerName}
          onChange={(e) => setForm({ ...form, customerName: e.target.value })}
        />
        <input
          placeholder={t('phoneNumber')}
          value={form.phoneNumber}
          onChange={(e) => setForm({ ...form, phoneNumber: e.target.value })}
        />
        <input
          placeholder={t('deliveryAddress')}
          value={form.deliveryAddress}
          onChange={(e) => setForm({ ...form, deliveryAddress: e.target.value })}
        />
        <input
          placeholder={t('city')}
          value={form.city}
          onChange={(e) => setForm({ ...form, city: e.target.value })}
        />
        <textarea
          placeholder={t('notes')}
          value={form.notes}
          onChange={(e) => setForm({ ...form, notes: e.target.value })}
          rows={3}
        />

        {/* Payment method selector */}
        <div style={{ display: 'flex', gap: 10 }}>
          <button
            type="button"
            onClick={() => { setForm({ ...form, paymentMethod: 1 }); setShowCardForm(false) }}
            style={{
              flex: 1, padding: '12px 8px', borderRadius: 10, cursor: 'pointer',
              border: `2px solid ${form.paymentMethod === 1 ? 'var(--primary)' : 'var(--border)'}`,
              background: form.paymentMethod === 1 ? 'var(--primary-light, #fff7f0)' : 'var(--surface)',
              display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6
            }}
          >
            <Banknote size={22} style={{ color: form.paymentMethod === 1 ? 'var(--primary)' : 'var(--muted)' }} />
            <span style={{ fontSize: 13, fontWeight: 600 }}>{t('cashOnDelivery') || 'Cash on Delivery'}</span>
          </button>

          <button
            type="button"
            onClick={() => { setForm({ ...form, paymentMethod: 2 }); setShowCardForm(false) }}
            style={{
              flex: 1, padding: '12px 8px', borderRadius: 10, cursor: 'pointer',
              border: `2px solid ${form.paymentMethod === 2 ? 'var(--primary)' : 'var(--border)'}`,
              background: form.paymentMethod === 2 ? 'var(--primary-light, #fff7f0)' : 'var(--surface)',
              display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6
            }}
          >
            <CreditCard size={22} style={{ color: form.paymentMethod === 2 ? 'var(--primary)' : 'var(--muted)' }} />
            <span style={{ fontSize: 13, fontWeight: 600 }}>{t('onlinePayment') || 'Online Payment'}</span>
          </button>
        </div>

        {/* Card form */}
        {showCardForm && (
          <CardForm
            total={total + DELIVERY_FEE}
            onSuccess={() => submitOrder(savedItems)}
            onCancel={() => setShowCardForm(false)}
          />
        )}

        {message && <p className="error">{message}</p>}

        {!showCardForm && (
          <button
            className="primary-btn"
            type="button"
            disabled={saving || items.length === 0}
            onClick={placeOrder}
          >
            {saving ? t('loading') : t('placeOrder')}
          </button>
        )}
      </div>
    </section>
  )
}