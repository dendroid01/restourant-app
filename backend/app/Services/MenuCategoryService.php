<?php

namespace App\Services;

use App\Models\MenuCategory;
use App\Models\MenuItem;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class MenuCategoryService
{
    /**
     * Получить все категории (деревом) - возвращает коллекцию моделей с загруженными children
     */
    public function getTree()
    {
        $categories = MenuCategory::with(['children' => function ($query) {
            $query->orderBy('order');
        }])
            ->whereNull('parent_id')
            ->orderBy('order')
            ->get();

        return $categories;
    }

    /**
     * Получить все категории плоским списком (для select)
     */
    public function getFlatList(): array
    {
        $categories = MenuCategory::orderBy('parent_id')
            ->orderBy('order')
            ->get();

        return $this->buildFlatList($categories);
    }

    /**
     * Получить категорию по ID с потомками
     */
    public function findById(int $id): ?MenuCategory
    {
        return MenuCategory::with('parent', 'children')->find($id);
    }

    /**
     * Создать категорию
     */
    public function create(array $data): MenuCategory
    {
        return DB::transaction(function () use ($data) {
            // Генерируем slug, если не передан
            if (empty($data['slug'])) {
                $data['slug'] = Str::slug($data['title_ru']);
            }

            // Проверяем уникальность slug
            $data['slug'] = $this->makeUniqueSlug($data['slug']);

            $category = new MenuCategory();
            $category->fill($this->prepareData($data));
            $category->save();

            return $category;
        });
    }

    /**
     * Обновить категорию
     */
    public function update(int $id, array $data): ?MenuCategory
    {
        $category = $this->findById($id);
        if (!$category) {
            return null;
        }

        return DB::transaction(function () use ($category, $data) {
            // Если изменился parent_id, проверяем на циклическую зависимость
            if (isset($data['parent_id']) && $data['parent_id'] !== $category->parent_id) {
                if ($this->wouldCreateCycle($category->id, $data['parent_id'])) {
                    throw new \Exception('Нельзя переместить категорию в собственную дочернюю');
                }
            }

            // Обновляем slug, если изменился заголовок
            if (isset($data['title_ru']) && $data['title_ru'] !== $category->title_ru) {
                $data['slug'] = Str::slug($data['title_ru']);
                $data['slug'] = $this->makeUniqueSlug($data['slug'], $category->id);
            }

            $category->fill($this->prepareData($data));
            $category->save();

            return $category->fresh('parent', 'children');
        });
    }

    /**
     * Удалить категорию
     */
    public function delete(int $id): bool
    {
        $category = $this->findById($id);
        if (!$category) {
            return false;
        }

        return DB::transaction(function () use ($category) {
            // Проверяем, есть ли блюда в категории
            if ($category->items()->count() > 0) {
                throw new \Exception('Нельзя удалить категорию, содержащую блюда');
            }

            // Удаляем дочерние категории рекурсивно
            foreach ($category->children as $child) {
                $this->delete($child->id);
            }

            return $category->delete();
        });
    }

    /**
     * Построение плоского списка с отступами
     */
    private function buildFlatList($categories, $parentId = null, $depth = 0): array
    {
        $result = [];
        foreach ($categories as $category) {
            if ($category->parent_id === $parentId) {
                $prefix = str_repeat('— ', $depth);
                $result[] = [
                    'id' => $category->id,
                    'title' => $prefix . ($category->title_ru ?? $category->title_en),
                    'title_ru' => $category->title_ru,
                    'depth' => $depth,
                    'parent_id' => $category->parent_id,
                ];
                $result = array_merge($result, $this->buildFlatList($categories, $category->id, $depth + 1));
            }
        }
        return $result;
    }

    /**
     * Проверка на циклическую зависимость
     */
    private function wouldCreateCycle(int $categoryId, ?int $newParentId): bool
    {
        if (!$newParentId) {
            return false;
        }

        $parent = MenuCategory::find($newParentId);
        while ($parent) {
            if ($parent->id === $categoryId) {
                return true;
            }
            $parent = $parent->parent;
        }
        return false;
    }

    /**
     * Генерация уникального slug
     */
    private function makeUniqueSlug(string $slug, ?int $excludeId = null): string
    {
        $original = $slug;
        $counter = 1;

        while ($this->slugExists($slug, $excludeId)) {
            $slug = $original . '-' . $counter;
            $counter++;
        }

        return $slug;
    }

    /**
     * Проверка существования slug
     */
    private function slugExists(string $slug, ?int $excludeId = null): bool
    {
        $query = MenuCategory::where('slug', $slug);
        if ($excludeId) {
            $query->where('id', '!=', $excludeId);
        }
        return $query->exists();
    }

    /**
     * Подготовка данных
     */
    private function prepareData(array $data): array
    {
        // Пустой parent_id -> null
        if (empty($data['parent_id'])) {
            $data['parent_id'] = null;
        }

        // Булевы значения
        $data['is_active'] = isset($data['is_active']) ? (bool) $data['is_active'] : true;

        return $data;
    }

    /**
     * Обновить порядок категорий
     */
    public function updateOrder(array $orders): bool
    {
        foreach ($orders as $item) {
            MenuCategory::where('id', $item['id'])->update([
                'order' => $item['order'] ?? 0,
                'parent_id' => $item['parent_id'] ?? null,
            ]);
        }
        return true;
    }

    /**
     * Получить статусы активности для select
     */
    public function getActiveStatuses(): array
    {
        return [
            ['value' => 1, 'label' => 'Активна'],
            ['value' => 0, 'label' => 'Скрыта'],
        ];
    }

    // app/Services/MenuCategoryService.php - добавить методы

    /**
     * Получить активные категории с блюдами (для публичной части)
     */
    public function getActiveCategoriesWithItems(): array
    {
        $categories = MenuCategory::where('is_active', true)
            ->whereNull('parent_id')
            ->with(['children' => function ($q) {
                $q->where('is_active', true)->orderBy('order');
            }, 'items' => function ($q) {
                $q->where('is_active', true)->orderBy('order');
            }])
            ->orderBy('order')
            ->get();

        return $this->buildPublicTree($categories);
    }

    /**
     * Построение дерева для публичной части (с блюдами)
     */
    private function buildPublicTree($categories): array
    {
        $result = [];
        foreach ($categories as $category) {
            $item = [
                'id' => $category->id,
                'slug' => $category->slug,
                'title_ru' => $category->title_ru,
                'title_en' => $category->title_en,
                'items' => $this->formatItems($category->items),
                'children' => [],
            ];

            if ($category->children->count() > 0) {
                $item['children'] = $this->buildPublicTree($category->children);
            }

            $result[] = $item;
        }
        return $result;
    }

    /**
     * Форматирование блюд для публичной части
     */
    private function formatItems($items): array
    {
        return $items->map(function ($item) {
            return [
                'id' => $item->id,
                'title_ru' => $item->title_ru,
                'title_en' => $item->title_en,
                'description_ru' => $item->description_ru,
                'description_en' => $item->description_en,
                'price' => $item->price,
                'image' => $item->image,
                'is_featured' => $item->is_featured,
            ];
        })->toArray();
    }

    /**
     * Получить все активные блюда (для публичной части)
     */
    public function getActiveItems(array $filters = []): array
    {
        $query = MenuItem::where('is_active', true)->with('category');

        // Фильтр по категории
        if (!empty($filters['category_id'])) {
            $query->where('category_id', $filters['category_id']);
        }

        // Фильтр по slug категории
        if (!empty($filters['category_slug'])) {
            $query->whereHas('category', function ($q) use ($filters) {
                $q->where('slug', $filters['category_slug']);
            });
        }

        // Только рекомендуемые
        if (!empty($filters['featured'])) {
            $query->where('is_featured', true);
        }

        // Поиск
        if (!empty($filters['search'])) {
            $query->where(function ($q) use ($filters) {
                $q->where('title_ru', 'like', '%' . $filters['search'] . '%')
                    ->orWhere('title_en', 'like', '%' . $filters['search'] . '%');
            });
        }

        $items = $query->orderBy('order')->get();

        return $items->map(function ($item) {
            return [
                'id' => $item->id,
                'category_id' => $item->category_id,
                'category_slug' => $item->category?->slug,
                'title_ru' => $item->title_ru,
                'title_en' => $item->title_en,
                'description_ru' => $item->description_ru,
                'description_en' => $item->description_en,
                'price' => $item->price,
                'image' => $item->image,
                'is_featured' => $item->is_featured,
            ];
        })->toArray();
    }

    /**
     * Получить блюдо по ID (для публичной части)
     */
    public function getActiveItem(int $id): ?array
    {
        $item = MenuItem::where('is_active', true)->with('category')->find($id);

        if (!$item) {
            return null;
        }

        return [
            'id' => $item->id,
            'category_id' => $item->category_id,
            'category_slug' => $item->category?->slug,
            'category_title_ru' => $item->category?->title_ru,
            'category_title_en' => $item->category?->title_en,
            'title_ru' => $item->title_ru,
            'title_en' => $item->title_en,
            'description_ru' => $item->description_ru,
            'description_en' => $item->description_en,
            'price' => $item->price,
            'image' => $item->image,
            'is_featured' => $item->is_featured,
        ];
    }
}
