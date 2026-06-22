import { useTranslation } from 'react-i18next'

export default function MenuItemCard({ item, onAdd }) {
  const { i18n, t } = useTranslation()
  const name = i18n.language === 'ar' ? item.nameAr : item.nameEn
  const description = i18n.language === 'ar' ? item.descriptionAr : item.descriptionEn
  const category = i18n.language === 'ar' ? item.categoryNameAr : item.categoryNameEn

  return (
    <article className="food-card">
      <img src={item.imageUrl} alt={name} className="food-image" />
      <div className="food-content">
        <div className="food-meta">
          <span className="badge">{category}</span>
          <span className={item.isAvailable ? 'badge success' : 'badge danger'}>
            {item.isAvailable ? t('available') : t('unavailable')}
          </span>
        </div>
        <h3>{name}</h3>
        <p>{description}</p>
        <div className="food-footer">
          <strong>{item.price.toFixed(2)} EGP</strong>
          <button className="primary-btn" disabled={!item.isAvailable} onClick={() => onAdd(item)}>
            {t('addToCart')}
          </button>
        </div>
      </div>
    </article>
  )
}
