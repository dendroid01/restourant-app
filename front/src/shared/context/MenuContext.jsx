// src/contexts/MenuContext.jsx
import { createContext, useContext, useState, useEffect } from 'react'
import { publicMenu } from '../../api/public'

const MenuContext = createContext()

export function MenuProvider({ children }) {
    const [categories, setCategories] = useState([])
    const [featuredItems, setFeaturedItems] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)

    useEffect(() => {
        const loadMenuData = async () => {
            setLoading(true)
            setError(null)
            try {
                // Загружаем параллельно
                const [categoriesRes, featuredRes] = await Promise.all([
                    publicMenu.getCategories(),
                    publicMenu.getFeatured(10)
                ])

                if (categoriesRes.success) {
                    setCategories(categoriesRes.data)
                }
                if (featuredRes.success) {
                    setFeaturedItems(featuredRes.data)
                }
            } catch (err) {
                setError(err.message)
            } finally {
                setLoading(false)
            }
        }

        loadMenuData()
    }, [])

    return (
        <MenuContext.Provider value={{ categories, featuredItems, loading, error }}>
            {children}
        </MenuContext.Provider>
    )
}

export function useMenu() {
    const context = useContext(MenuContext)
    if (!context) {
        throw new Error('useMenu must be used within MenuProvider')
    }
    return context
}