import { useTranslation } from 'react-i18next'
import { Globe } from 'lucide-react'

export default function LanguageSwitcher() {
  const { i18n, t } = useTranslation()

  const changeLanguage = (lang) => {
    i18n.changeLanguage(lang)
    localStorage.setItem('lang', lang)
    document.documentElement.lang = lang
    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr'
  }

  return (
    <div className="lang-switcher">
      <Globe size={15} className="lang-icon" />
      <div className="lang-track">
        <button
          className={i18n.language === 'en' ? 'lang-pill active' : 'lang-pill'}
          onClick={() => changeLanguage('en')}
        >
          {t('english')}
        </button>
        <button
          className={i18n.language === 'ar' ? 'lang-pill active' : 'lang-pill'}
          onClick={() => changeLanguage('ar')}
        >
          {t('arabic')}
        </button>
      </div>
    </div>
  )
}