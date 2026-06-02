import { useState, useEffect } from 'react'
import { publicMenu } from '../../api/public'

export function useNavigation() {
    const [menuCategories, setMenuCategories] = useState([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const loadCategories = async () => {
            try {
                const response = await publicMenu.getCategories()
                if (response.success) {
                    const rootCategories = response.data.filter(cat => !cat.parent_id)
                    setMenuCategories(rootCategories)
                }
            } catch (error) {
                console.error('Failed to load menu categories:', error)
            } finally {
                setLoading(false)
            }
        }

        loadCategories()
    }, [])

    return { menuCategories, loading }
}