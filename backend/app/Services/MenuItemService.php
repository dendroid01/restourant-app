<?php

namespace App\Services;

use App\Models\MenuItem;
use App\Models\MenuCategory;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;

class MenuItemService
{
    /**
     * Получить список блюд с пагинацией и фильтрацией
     */
    public function getPaginated(array $filters = [], int $perPage = 10): LengthAwarePaginator
    {
        $query = MenuItem::with('category');

        // Фильтры (без изменений)
        if (!empty($filters['category_id'])) {
            $query->where('category_id', $filters['category_id']);
        }

        if (isset($filters['is_active']) && $filters['is_active'] !== '') {
            $query->where('is_active', (bool)$filters['is_active']);
        }

        if (isset($filters['is_featured']) && $filters['is_featured'] !== '') {
            $query->where('is_featured', (bool)$filters['is_featured']);
        }

        if (isset($filters['is_available_for_events']) && $filters['is_available_for_events'] !== '') {
            $query->where('is_available_for_events', (bool)$filters['is_available_for_events']);
        }

        if (!empty($filters['search'])) {
            $query->where(function ($q) use ($filters) {
                $q->where('title_ru', 'like', '%' . $filters['search'] . '%')
                    ->orWhere('title_en', 'like', '%' . $filters['search'] . '%');
            });
        }

        // ========== СОРТИРОВКА С УЧЁТОМ ЯЗЫКА ==========
        $sortField = $filters['sort_by'] ?? 'title';
        $sortOrder = $filters['sort_order'] ?? 'asc';
        $locale = $filters['locale'] ?? 'ru'; // язык из запроса

        // Определяем поле для сортировки по названию в зависимости от языка
        if ($sortField === 'title') {
            $sortField = $locale === 'en' ? 'title_en' : 'title_ru';
        }

        // Сортировка по категории (тоже с учётом языка)
        if ($sortField === 'category') {
            $categoryField = $locale === 'en' ? 'title_en' : 'title_ru';
            $query->join('menu_categories', 'menu_items.category_id', '=', 'menu_categories.id')
                ->orderBy("menu_categories.{$categoryField}", $sortOrder)
                ->select('menu_items.*');
        } // Сортировка по остальным полям
        elseif (in_array($sortField, ['title_ru', 'title_en', 'price', 'created_at', 'id'])) {
            $query->orderBy($sortField, $sortOrder);
        } // fallback
        else {
            $defaultField = $locale === 'en' ? 'title_en' : 'title_ru';
            $query->orderBy($defaultField, 'asc');
        }

        return $query->paginate($perPage);
    }

    /**
     * Получить блюда для калькулятора мероприятий
     */
    public function getEventDishes(): array
    {
        return MenuItem::where('is_available_for_events', true)
            ->where('is_active', true)
            ->orderBy('title_ru')
            ->get(['id', 'title_ru', 'title_en', 'price'])
            ->toArray();
    }

    /**
     * Получить рекомендуемые блюда (для слайдшоу на главной)
     */
    public function getFeaturedDishes(int $limit = 10): array
    {
        return MenuItem::where('is_featured', true)
            ->where('is_active', true)
            ->with('category')
            ->orderBy('order')
            ->limit($limit)
            ->get()
            ->toArray();
    }

    /**
     * Получить блюдо по ID
     */
    public function findById(int $id): ?MenuItem
    {
        return MenuItem::with('category')->find($id);
    }

    /**
     * Создать блюдо
     */
    public function create(array $data): MenuItem
    {
        return DB::transaction(function () use ($data) {
            $item = new MenuItem();
            $item->fill($this->prepareData($data));
            $item->save();

            return $item->load('category');
        });
    }

    /**
     * Обновить блюдо
     */
    public function update(int $id, array $data): ?MenuItem
    {
        $item = $this->findById($id);
        if (!$item) {
            return null;
        }

        return DB::transaction(function () use ($item, $data) {
            $item->fill($this->prepareData($data));
            $item->save();

            return $item->load('category');
        });
    }

    /**
     * Удалить блюдо
     */
    public function delete(int $id): bool
    {
        $item = $this->findById($id);
        if (!$item) {
            return false;
        }

        return DB::transaction(function () use ($item) {
            // Удаляем изображение
            if ($item->image) {
                $this->deleteImageFile($item->image);
            }
            return $item->delete();
        });
    }

    /**
     * Массовое обновление статуса активности
     */
    public function bulkUpdateStatus(array $ids, bool $isActive): int
    {
        return MenuItem::whereIn('id', $ids)->update(['is_active' => $isActive]);
    }

    /**
     * Массовое обновление флага "рекомендуемое"
     */
    public function bulkUpdateFeatured(array $ids, bool $isFeatured): int
    {
        return MenuItem::whereIn('id', $ids)->update(['is_featured' => $isFeatured]);
    }

    /**
     * Обновить порядок блюд внутри категории
     */
    public function updateOrder(array $orders): bool
    {
        foreach ($orders as $item) {
            MenuItem::where('id', $item['id'])->update([
                'order' => $item['order'] ?? 0,
            ]);
        }
        return true;
    }

    /**
     * Подготовка данных перед сохранением
     */
    private function prepareData(array $data): array
    {
        // Преобразуем цену
        if (isset($data['price'])) {
            $data['price'] = (float)$data['price'];
        }

        // Булевы значения
        $data['is_featured'] = isset($data['is_featured']) ? (bool)$data['is_featured'] : false;
        $data['is_active'] = isset($data['is_active']) ? (bool)$data['is_active'] : true;
        $data['is_available_for_events'] = isset($data['is_available_for_events']) ? (bool)$data['is_available_for_events'] : false;

        // Очистка HTML-описаний (сохраняем как есть, RichTextEditor передаёт HTML)
        if (isset($data['description_ru']) && $data['description_ru'] === '') {
            $data['description_ru'] = null;
        }
        if (isset($data['description_en']) && $data['description_en'] === '') {
            $data['description_en'] = null;
        }

        return $data;
    }

    /**
     * Удалить файл изображения
     */
    private function deleteImageFile(string $url): void
    {
        $path = str_replace('/storage/', '', parse_url($url, PHP_URL_PATH));
        if ($path && Storage::disk('public')->exists($path)) {
            Storage::disk('public')->delete($path);
        }
    }

    /**
     * Получить статистику по меню
     */
    public function getStats(): array
    {
        return [
            'total' => MenuItem::count(),
            'active' => MenuItem::where('is_active', true)->count(),
            'inactive' => MenuItem::where('is_active', false)->count(),
            'featured' => MenuItem::where('is_featured', true)->count(),
            'for_events' => MenuItem::where('is_available_for_events', true)->count(),
        ];
    }

    /**
     * Получить опции для фильтрации
     */
    public function getFilterOptions(): array
    {
        return [
            'active_statuses' => [
                ['value' => '', 'label' => 'Все'],
                ['value' => '1', 'label' => 'Активные'],
                ['value' => '0', 'label' => 'Неактивные'],
            ],
            'featured_statuses' => [
                ['value' => '', 'label' => 'Все'],
                ['value' => '1', 'label' => 'Рекомендуемые'],
                ['value' => '0', 'label' => 'Обычные'],
            ],
            'event_statuses' => [
                ['value' => '', 'label' => 'Все'],
                ['value' => '1', 'label' => 'Доступны для мероприятий'],
                ['value' => '0', 'label' => 'Недоступны для мероприятий'],
            ],
        ];
    }
}
