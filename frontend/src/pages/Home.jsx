import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'

export default function Home() {
  const { t } = useTranslation()
  return (
    <section className="hero">
      <div>
        <span className="eyebrow">Prototype</span>
        <h1>{t('welcomeTitle')}</h1>
        <p>{t('welcomeSubtitle')}</p>
        <Link to="/menu" className="primary-btn large">{t('browseMenu')}</Link>
      </div>
      <div className="hero-card">
        <div className="hero-stat">
          <strong>4+</strong>
          <span>Categories</span>
        </div>
        <div className="hero-stat">
          <strong>2</strong>
          <span>Payment methods</span>
        </div>
        <div className="hero-stat">
          <strong>2</strong>
          <span>Languages</span>
        </div>
      </div>
    </section>
  )
}
