// Маппинг из бэка в формат фронта (для отображения)
export const fromApiToFrontend = (apiManager) => ({
    id: apiManager.id,
    name: apiManager.name,
    email: apiManager.email,
    status: apiManager.is_active ? 'active' : 'blocked',
    rights: apiManager.permissions_labels || [], // используем уже готовые лейблы с бэка
    permissions: apiManager.permissions || [],
    role: apiManager.role,
    created_at: apiManager.created_at,
    created_at_formatted: apiManager.created_at_formatted,
})

// Маппинг из фронта в формат бэка (для отправки)
export const fromFrontendToApi = (frontendData, isCreate = true) => {
    const result = {
        name: frontendData.name,
        email: frontendData.email,
        is_active: frontendData.status === 'active',
    }

    if (isCreate && frontendData.password) {
        result.password = frontendData.password
    }

    if (!isCreate && frontendData.password) {
        result.password = frontendData.password
    }

    // Преобразуем права из лейблов в значения
    if (frontendData.rights) {
        // Нужна маппинг-таблица лейбл -> значение
        const labelToValue = {
            'Дашборд': 'dashboard',
            'Новости': 'news',
            'Рестораны': 'restaurants',
            'Меню': 'menu',
            'Страницы': 'pages',
            'Отзывы': 'reviews',
            'Заказы': 'orders',
        }
        result.permissions = frontendData.rights.map(label => labelToValue[label]).filter(Boolean)
    }

    return result
}

// Маппинг доступных разделов из бэка в формат для чекбоксов
export const mapSectionsFromApi = (apiSections) => {
    // API возвращает [{ value: 'news', label: 'Новости' }, ...]
    // Нам нужен массив лейблов для ALL_RIGHTS
    return apiSections.map(section => section.label)
}