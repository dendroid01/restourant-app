<?php

namespace App\Services;

use App\Models\Restaurant;
use App\Models\RestaurantGallery;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;

class RestaurantService
{
    /**
     * Получить список ресторанов с пагинацией и фильтрацией
     */
    public function getPaginated(array $filters = [], int $perPage = 10): LengthAwarePaginator
    {
        $query = Restaurant::with(['galleries' => function ($q) {
            $q->orderBy('order', 'asc'); // Сортируем галерею по порядку
        }]);

        // Фильтр по статусу
        if (!empty($filters['status'])) {
            $query->where('status', $filters['status']);
        }

        // Фильтр по поиску
        if (!empty($filters['search'])) {
            $query->where(function ($q) use ($filters) {
                $q->where('name_ru', 'like', '%' . $filters['search'] . '%')
                    ->orWhere('name_en', 'like', '%' . $filters['search'] . '%')
                    ->orWhere('address_ru', 'like', '%' . $filters['search'] . '%');
            });
        }

        // Сортировка (по умолчанию order ASC)
        $sortField = $filters['sort_by'] ?? 'order';
        $sortOrder = $filters['sort_order'] ?? 'asc';
        $query->orderBy($sortField, $sortOrder);

        return $query->paginate($perPage);
    }

    /**
     * Получить все рестораны (без пагинации, для select)
     */
    public function getAllActive(): array
    {
        return Restaurant::where('status', 'active')
            ->orderBy('order')
            ->get(['id', 'name_ru', 'name_en'])
            ->toArray();
    }

    /**
     * Получить ресторан по ID с галереей
     */
    public function findById(int $id): ?Restaurant
    {
        return Restaurant::with('galleries')->find($id);
    }

    /**
     * Создать ресторан
     */
    public function create(array $data): Restaurant
    {
        return DB::transaction(function () use ($data) {
            // Создаём ресторан
            $restaurant = new Restaurant();
            $restaurant->fill($this->prepareData($data));
            $restaurant->save();

            // Обрабатываем галерею
            if (!empty($data['galleries'])) {
                $this->syncGalleries($restaurant, $data['galleries']);
            }

            return $restaurant->load('galleries');
        });
    }

    /**
     * Обновить ресторан
     */
    public function update(int $id, array $data): ?Restaurant
    {
        $restaurant = $this->findById($id);
        if (!$restaurant) {
            return null;
        }

        return DB::transaction(function () use ($restaurant, $data) {
            $restaurant->fill($this->prepareData($data));
            $restaurant->save();

            // Обрабатываем галерею
            if (isset($data['galleries'])) {
                $this->syncGalleries($restaurant, $data['galleries']);
            }

            return $restaurant->load('galleries');
        });
    }

    /**
     * Удалить ресторан
     */
    public function delete(int $id): bool
    {
        $restaurant = $this->findById($id);
        if (!$restaurant) {
            return false;
        }

        return DB::transaction(function () use ($restaurant) {
            // Удаляем файлы галереи
            foreach ($restaurant->galleries as $gallery) {
                $this->deleteImageFile($gallery->image_url);
            }
            return $restaurant->delete();
        });
    }

    /**
     * Синхронизация галереи
     */
    private function syncGalleries(Restaurant $restaurant, array $galleries): void
    {
        $existingIds = $restaurant->galleries->pluck('id')->toArray();
        $newIds = [];

        foreach ($galleries as $index => $galleryData) {
            if (isset($galleryData['id']) && in_array($galleryData['id'], $existingIds)) {
                // Обновляем существующее
                $gallery = RestaurantGallery::find($galleryData['id']);
                if ($gallery) {
                    $gallery->update([
                        'order' => $galleryData['order'] ?? $index,
                    ]);
                    $newIds[] = $gallery->id;
                }
            } elseif (!empty($galleryData['image_url'])) {
                // Создаём новое
                $gallery = $restaurant->galleries()->create([
                    'image_url' => $galleryData['image_url'],
                    'order' => $galleryData['order'] ?? $index,
                ]);
                $newIds[] = $gallery->id;
            }
        }

        // Удаляем отсутствующие
        $toDelete = array_diff($existingIds, $newIds);
        if (!empty($toDelete)) {
            $images = RestaurantGallery::whereIn('id', $toDelete)->get();
            foreach ($images as $image) {
                $this->deleteImageFile($image->image_url);
                $image->delete();
            }
        }
    }

    /**
     * Подготовка данных перед сохранением
     */
    private function prepareData(array $data): array
    {
        // Преобразуем координаты в decimal
        if (isset($data['lat']) && $data['lat'] !== '') {
            $data['lat'] = (float)$data['lat'];
        }
        if (isset($data['lng']) && $data['lng'] !== '') {
            $data['lng'] = (float)$data['lng'];
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
     * Обновить порядок ресторанов (для слайдшоу)
     */
    public function updateOrder(array $orders): bool
    {
        foreach ($orders as $item) {
            Restaurant::where('id', $item['id'])->update(['order' => $item['order']]);
        }
        return true;
    }

    /**
     * Получить статусы для select
     */
    public function getStatuses(): array
    {
        return [
            ['value' => 'active', 'label' => 'Активен'],
            ['value' => 'inactive', 'label' => 'Скрыт'],
        ];
    }
}
