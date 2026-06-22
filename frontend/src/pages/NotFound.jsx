import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { ChefHat, ArrowLeft } from 'lucide-react'

export default function NotFound() {
  const { t } = useTranslation()
  return (
    <div className="page-center stack" style={{ textAlign: 'center' }}>
      <span className="brand-mark" style={{ width: 56, height: 56, borderRadius: 18, margin: '0 auto' }}>
        <ChefHat size={26} />
      </span>
      <h1 style={{ fontFamily: 'var(--font-display)', margin: 0 }}>404</h1>
      <p className="muted" style={{ margin: 0 }}>{t('notFound')}</p>
      <Link to="/" className="primary-btn" style={{ justifySelf: 'center' }}>
        <ArrowLeft size={16} /> {t('backHome')}
      </Link>
    </div>
  )
}