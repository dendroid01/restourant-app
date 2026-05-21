import { useState, useCallback } from 'react'

function loadFromStorage(key, fallback) {
    try {
        const raw = localStorage.getItem(key)
        return raw ? JSON.parse(raw) : fallback
    } catch {
        return fallback
    }
}

function saveToStorage(key, data) {
    localStorage.setItem(key, JSON.stringify(data))
}

function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).slice(2)
}

export function useAdminStore(storageKey, initialData = []) {
    const [items, setItems] = useState(() =>
        loadFromStorage(storageKey, initialData)
    )

    const persist = useCallback((newItems) => {
        setItems(newItems)
        saveToStorage(storageKey, newItems)
    }, [storageKey])

    const create = useCallback((data) => {
        const newItem = { ...data, id: generateId(), createdAt: new Date().toISOString() }
        persist([...items, newItem])
        return newItem
    }, [items, persist])

    const update = useCallback((id, data) => {
        const updated = items.map(item =>
            item.id === id ? { ...item, ...data, updatedAt: new Date().toISOString() } : item
        )
        persist(updated)
    }, [items, persist])

    const remove = useCallback((id) => {
        persist(items.filter(item => item.id !== id))
    }, [items, persist])

    const getById = useCallback((id) =>
            items.find(item => item.id === id) ?? null,
        [items]
    )

    return { items, create, update, remove, getById, setItems: persist }
}