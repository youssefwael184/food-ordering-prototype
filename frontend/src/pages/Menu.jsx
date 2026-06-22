import { useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import api from '../api/client'
import MenuItemCard from '../components/MenuItemCard'
import { useCart } from '../context/CartContext'

export default function Menu() {
  const { t, i18n } = useTranslation()
  const { addItem } = useCart()
  const [categories, setCategories] = useState([])
  const [items, setItems] = useState([])
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([api.get('/api/menu/categories'), api.get('/api/menu/items')])
      .then(([c, m]) => {
        setCategories(c.data)
        setItems(m.data)
      })
      .finally(() => setLoading(false))
  }, [])

  const filtered = useMemo(() => {
    if (selectedCategory === 'all') return items
    return items.filter((x) => x.categoryId === selectedCategory)
  }, [items, selectedCategory])

  if (loading) return <div className="page-center">{t('loading')}</div>

  return (
    <section className="stack">
      <div className="section-head">
        <h2>{t('menu')}</h2>
        <div className="filters">
          <button className={selectedCategory === 'all' ? 'chip active' : 'chip'} onClick={() => setSelectedCategory('all')}>{t('all')}</button>
          {categories.map((c) => (
            <button key={c.id} className={selectedCategory === c.id ? 'chip active' : 'chip'} onClick={() => setSelectedCategory(c.id)}>
              {i18n.language === 'ar' ? c.nameAr : c.nameEn}
            </button>
          ))}
        </div>
      </div>

      <div className="grid cards-grid">
        {filtered.map((item) => <MenuItemCard key={item.id} item={item} onAdd={addItem} />)}
      </div>
    </section>
  )
}
