import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { LayoutGrid, CreditCard, Languages, ArrowRight } from 'lucide-react'

export default function Home() {
  const { t } = useTranslation()
  return (
    <section className="hero">
      <div>
        <span className="eyebrow">Prototype</span>
        <h1>{t('welcomeTitle')}</h1>
        <p>{t('welcomeSubtitle')}</p>
        <Link to="/menu" className="primary-btn large">
          {t('browseMenu')} <ArrowRight size={18} />
        </Link>
      </div>
      <div className="hero-card">
        <div className="hero-stat">
          <LayoutGrid size={18} className="muted" />
          <strong>4+</strong>
          <span className="muted">Categories</span>
        </div>
        <div className="hero-stat">
          <CreditCard size={18} className="muted" />
          <strong>2</strong>
          <span className="muted">Payment methods</span>
        </div>
        <div className="hero-stat">
          <Languages size={18} className="muted" />
          <strong>2</strong>
          <span className="muted">Languages</span>
        </div>
      </div>
    </section>
  )
}