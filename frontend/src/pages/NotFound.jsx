import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'

export default function NotFound() {
  const { t } = useTranslation()
  return (
    <div className="page-center stack">
      <h1>404</h1>
      <p>{t('notFound')}</p>
      <Link to="/" className="primary-btn">{t('backHome')}</Link>
    </div>
  )
}
