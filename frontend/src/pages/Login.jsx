import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useTranslation } from 'react-i18next'
import { LogIn } from 'lucide-react'

export default function Login() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const { t } = useTranslation()
  const [form, setForm] = useState({ email: '', password: '' })
  const [error, setError] = useState('')

const submit = async (e) => {
  e.preventDefault()
  try {
    const loggedInUser = await login(form.email, form.password)
    if (loggedInUser.role?.toLowerCase() === 'admin') {
      navigate('/admin')
    } else {
      navigate('/')
    }
  } catch (err) {
    setError(err.message)
  }
}

  return (
    <div className="auth-page">
      <form className="panel auth-panel form-panel" onSubmit={submit}>
        <h2 style={{ marginTop: 0, fontFamily: 'var(--font-display)' }}>{t('login')}</h2>
        <input placeholder={t('email')} value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
        <input type="password" placeholder={t('password')} value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
        {error && <p className="error">{error}</p>}
        <button className="primary-btn"><LogIn size={16} /> {t('signIn')}</button>
        <p className="muted">
          {t('noAccount')} <Link to="/register" style={{ color: 'var(--primary-dark)', fontWeight: 600 }}>{t('createAccount')}</Link>
        </p>
      </form>
    </div>
  )
}