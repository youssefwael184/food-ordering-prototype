import { useTranslation } from 'react-i18next'
import { Plus } from 'lucide-react'

export default function MenuItemCard({ item, onAdd }) {
  const { i18n, t } = useTranslation()
  const name = i18n.language === 'ar' ? item.nameAr : item.nameEn
  const description = i18n.language === 'ar' ? item.descriptionAr : item.descriptionEn
  const category = i18n.language === 'ar' ? item.categoryNameAr : item.categoryNameEn

  return (
    <article className="food-card">
      <div className="food-image-wrap">
        <img src={item.imageUrl} alt={name} className="food-image" />
        <span className={item.isAvailable ? 'food-status badge success' : 'food-status badge danger'}>
          {item.isAvailable ? t('available') : t('unavailable')}
        </span>
      </div>

      <div className="food-content">
        <span className="food-category">{category}</span>
        <h3>{name}</h3>
        <p>{description}</p>
      </div>

      <div className="ticket-divider" aria-hidden="true" />

      <div className="food-footer">
        <strong className="food-price">
          {item.price.toFixed(2)} <span className="currency">EGP</span>
        </strong>
        <button className="primary-btn" disabled={!item.isAvailable} onClick={() => onAdd(item)}>
          <Plus size={16} /> {t('addToCart')}
        </button>
      </div>
    </article>
  )
}