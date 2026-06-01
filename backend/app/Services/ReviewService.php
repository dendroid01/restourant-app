<?php

namespace App\Services;

use App\Models\Review;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Support\Facades\DB;

class ReviewService
{
    /**
     * Получить список отзывов с пагинацией и фильтрацией
     */
    public function getPaginated(array $filters = [], int $perPage = 10): LengthAwarePaginator
    {
        $query = Review::query();

        // Фильтр по статусу
        if (!empty($filters['status']) && $filters['status'] !== 'all') {
            $query->where('status', $filters['status']);
        }

        // Фильтр по рейтингу
        if (!empty($filters['rating'])) {
            $query->where('rating', $filters['rating']);
        }

        // Поиск по имени или тексту
        if (!empty($filters['search'])) {
            $query->where(function ($q) use ($filters) {
                $q->where('name', 'like', '%' . $filters['search'] . '%')
                    ->orWhere('text_ru', 'like', '%' . $filters['search'] . '%')
                    ->orWhere('text_en', 'like', '%' . $filters['search'] . '%');
            });
        }

        // Фильтр по дате
        if (!empty($filters['date_from'])) {
            $query->whereDate('created_at', '>=', $filters['date_from']);
        }
        if (!empty($filters['date_to'])) {
            $query->whereDate('created_at', '<=', $filters['date_to']);
        }

        // Сортировка
        $sortField = $filters['sort_by'] ?? 'created_at';
        $sortOrder = $filters['sort_order'] ?? 'desc';
        $query->orderBy($sortField, $sortOrder);

        return $query->paginate($perPage);
    }

    /**
     * Получить отзыв по ID
     */
    public function findById(int $id): ?Review
    {
        return Review::find($id);
    }

    /**
     * Создать отзыв (из публичной формы)
     */
    public function create(array $data, string $ipAddress): Review
    {
        return DB::transaction(function () use ($data, $ipAddress) {
            $review = new Review();
            $review->fill([
                'name' => $data['name'],
                'email' => $data['email'] ?? null,
                'rating' => $data['rating'],
                'text_ru' => $data['text_ru'],
                'text_en' => $data['text_en'] ?? null,
                'ip_address' => $ipAddress,
                'status' => 'pending',
            ]);
            $review->save();

            return $review;
        });
    }

    /**
     * Одобрить отзыв
     */
    public function approve(int $id, int $userId): ?Review
    {
        $review = $this->findById($id);
        if (!$review) {
            return null;
        }

        return DB::transaction(function () use ($review, $userId) {
            $review->status = 'approved';
            $review->approved_at = now();
            $review->approved_by = $userId;
            $review->save();

            return $review;
        });
    }

    /**
     * Отклонить отзыв
     */
    public function reject(int $id): ?Review
    {
        $review = $this->findById($id);
        if (!$review) {
            return null;
        }

        $review->status = 'rejected';
        $review->save();

        return $review;
    }

    /**
     * Удалить отзыв
     */
    public function delete(int $id): bool
    {
        $review = $this->findById($id);
        if (!$review) {
            return false;
        }

        return $review->delete();
    }

    /**
     * Получить статистику по отзывам
     */
    public function getStats(): array
    {
        return [
            'total' => Review::count(),
            'pending' => Review::where('status', 'pending')->count(),
            'approved' => Review::where('status', 'approved')->count(),
            'rejected' => Review::where('status', 'rejected')->count(),
            'average_rating' => round(Review::where('status', 'approved')->avg('rating') ?? 0, 1),
        ];
    }

    /**
     * Получить статусы для фильтрации
     */
    public function getStatuses(): array
    {
        return [
            ['value' => 'all', 'label' => 'Все'],
            ['value' => 'pending', 'label' => 'На проверке'],
            ['value' => 'approved', 'label' => 'Одобренные'],
            ['value' => 'rejected', 'label' => 'Отклонённые'],
        ];
    }

    /**
     * Получить опции рейтинга для фильтра
     */
    public function getRatingOptions(): array
    {
        return [
            ['value' => '', 'label' => 'Все оценки'],
            ['value' => '5', 'label' => '★★★★★ (5)'],
            ['value' => '4', 'label' => '★★★★☆ (4)'],
            ['value' => '3', 'label' => '★★★☆☆ (3)'],
            ['value' => '2', 'label' => '★★☆☆☆ (2)'],
            ['value' => '1', 'label' => '★☆☆☆☆ (1)'],
        ];
    }
}
