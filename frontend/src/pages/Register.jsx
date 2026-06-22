import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useTranslation } from 'react-i18next'

export default function Register() {
  const { register } = useAuth()
  const navigate = useNavigate()
  const { t } = useTranslation()
  const [form, setForm] = useState({
    fullName: '',
    email: '',
    password: '',
    phoneNumber: '',
    preferredLanguage: 'en'
  })
  const [error, setError] = useState('')

  const submit = async (e) => {
    e.preventDefault()
    try {
      await register(form)
      navigate('/')
    } catch (err) {
      setError(err.message)
    }
  }

  return (
    <div className="auth-page">
      <form className="panel auth-panel" onSubmit={submit}>
        <h2>{t('register')}</h2>
        <input placeholder={t('fullName')} value={form.fullName} onChange={(e) => setForm({ ...form, fullName: e.target.value })} />
        <input placeholder={t('email')} value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
        <input type="password" placeholder={t('password')} value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
        <input placeholder={t('phoneNumber')} value={form.phoneNumber} onChange={(e) => setForm({ ...form, phoneNumber: e.target.value })} />
        <select value={form.preferredLanguage} onChange={(e) => setForm({ ...form, preferredLanguage: e.target.value })}>
          <option value="en">{t('english')}</option>
          <option value="ar">{t('arabic')}</option>
        </select>
        {error && <p className="error">{error}</p>}
        <button className="primary-btn">{t('signUp')}</button>
        <p className="muted">
          {t('haveAccount')} <Link to="/login">{t('signIn')}</Link>
        </p>
      </form>
    </div>
  )
}
