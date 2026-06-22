import { useTranslation } from 'react-i18next'

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
      <span className="muted">{t('language')}</span>
      <button className={i18n.language === 'en' ? 'chip active' : 'chip'} onClick={() => changeLanguage('en')}>{t('english')}</button>
      <button className={i18n.language === 'ar' ? 'chip active' : 'chip'} onClick={() => changeLanguage('ar')}>{t('arabic')}</button>
    </div>
  )
}
