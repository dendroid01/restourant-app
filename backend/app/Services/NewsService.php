<?php

namespace App\Services;

use App\Models\News;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class NewsService
{
    /**
     * Получить список новостей с пагинацией и фильтрацией
     */
    public function getPaginated(array $filters = [], int $perPage = 10): LengthAwarePaginator
    {
        $query = News::with('author');

        // Фильтр по статусу
        if (!empty($filters['status'])) {
            $query->where('status', $filters['status']);
        }

        // Фильтр по поиску (заголовок)
        if (!empty($filters['search'])) {
            $query->where(function ($q) use ($filters) {
                $q->where('title_ru', 'like', '%' . $filters['search'] . '%')
                    ->orWhere('title_en', 'like', '%' . $filters['search'] . '%');
            });
        }

        // Фильтр по дате
        if (!empty($filters['date_from'])) {
            $query->whereDate('published_at', '>=', $filters['date_from']);
        }
        if (!empty($filters['date_to'])) {
            $query->whereDate('published_at', '<=', $filters['date_to']);
        }

        // Сортировка
        $sortField = $filters['sort_by'] ?? 'published_at';
        $sortOrder = $filters['sort_order'] ?? 'desc';
        $query->orderBy($sortField, $sortOrder);

        return $query->paginate($perPage);
    }

    /**
     * Получить новость по ID
     */
    public function findById(int $id): ?News
    {
        return News::with('author')->find($id);
    }

    /**
     * Создать новость
     */
    public function create(array $data, int $authorId): News
    {
        return DB::transaction(function () use ($data, $authorId) {
            $news = new News();
            $news->fill($this->prepareData($data));
            $news->author_id = $authorId;

            // Если статус "опубликовано" и нет даты публикации - ставим сейчас
            if ($news->status === 'published' && !$news->published_at) {
                $news->published_at = now();
            }

            $news->save();
            return $news;
        });
    }

    /**
     * Обновить новость
     */
    public function update(int $id, array $data): ?News
    {
        $news = $this->findById($id);
        if (!$news) {
            return null;
        }

        return DB::transaction(function () use ($news, $data) {
            $news->fill($this->prepareData($data));

            // Если статус меняется на "опубликовано" и нет даты публикации - ставим сейчас
            if ($news->status === 'published' && !$news->published_at) {
                $news->published_at = now();
            }

            $news->save();
            return $news;
        });
    }

    /**
     * Удалить новость
     */
    public function delete(int $id): bool
    {
        $news = $this->findById($id);
        if (!$news) {
            return false;
        }
        return $news->delete();
    }

    /**
     * Подготовка данных перед сохранением
     */
    private function prepareData(array $data): array
    {
        // Обработка тегов (из строки в массив)
        if (isset($data['tags']) && is_string($data['tags'])) {
            $data['tags'] = array_map('trim', explode(',', $data['tags']));
        }

        // Если дата публикации передана, но ещё не timestamp
        if (isset($data['published_at']) && is_string($data['published_at'])) {
            $data['published_at'] = $data['published_at'] ?: null;
        }

        return $data;
    }

    /**
     * Получить для select-статусов
     */
    public function getStatuses(): array
    {
        return [
            ['value' => 'published', 'label' => 'Опубликовано'],
            ['value' => 'draft', 'label' => 'Черновик'],
        ];
    }

    /**
     * Получить краткую статистику по новостям
     */
    public function getStats(): array
    {
        return [
            'total' => News::count(),
            'published' => News::where('status', 'published')->count(),
            'draft' => News::where('status', 'draft')->count(),
        ];
    }
    /**
     * Получить опубликованные новости с пагинацией (для публичной части)
     */
    public function getPublishedNews(int $perPage = 9, array $filters = []): array
    {
        $query = News::where('status', 'published')
            ->whereNotNull('published_at')
            ->with('author');

        // Фильтр по году/месяцу
        if (!empty($filters['year'])) {
            $query->whereYear('published_at', $filters['year']);
        }
        if (!empty($filters['month'])) {
            $query->whereMonth('published_at', $filters['month']);
        }

        // Поиск по заголовку
        if (!empty($filters['search'])) {
            $query->where(function ($q) use ($filters) {
                $q->where('title_ru', 'like', '%' . $filters['search'] . '%')
                    ->orWhere('title_en', 'like', '%' . $filters['search'] . '%');
            });
        }

        $news = $query->orderBy('published_at', 'desc')
            ->paginate($perPage);

        return [
            'data' => $news->items(),
            'meta' => [
                'current_page' => $news->currentPage(),
                'last_page' => $news->lastPage(),
                'per_page' => $news->perPage(),
                'total' => $news->total(),
            ],
        ];
    }

    /**
     * Получить опубликованную новость по ID (для публичной части)
     */
    public function getPublishedNewsById(int $id): ?News
    {
        return News::where('status', 'published')
            ->whereNotNull('published_at')
            ->with('author')
            ->find($id);
    }

    /**
     * Получить последние новости (для виджета на главной)
     */
    public function getLatestNews(int $limit = 3): array
    {
        return News::where('status', 'published')
            ->whereNotNull('published_at')
            ->orderBy('published_at', 'desc')
            ->limit($limit)
            ->get()
            ->toArray();
    }

    /**
     * Получить архив по годам и месяцам
     */
    public function getArchive(): array
    {
        $results = News::where('status', 'published')
            ->whereNotNull('published_at')
            ->selectRaw('YEAR(published_at) as year, MONTH(published_at) as month, COUNT(*) as count')
            ->groupBy('year', 'month')
            ->orderBy('year', 'desc')
            ->orderBy('month', 'desc')
            ->get();

        $archive = [];
        foreach ($results as $item) {
            $archive[] = [
                'year' => $item->year,
                'month' => $item->month,
                'month_name_ru' => $this->getMonthNameRu($item->month),
                'month_name_en' => $this->getMonthNameEn($item->month),
                'count' => $item->count,
            ];
        }

        return $archive;
    }

    private function getMonthNameRu(int $month): string
    {
        $months = [
            1 => 'Январь', 2 => 'Февраль', 3 => 'Март', 4 => 'Апрель',
            5 => 'Май', 6 => 'Июнь', 7 => 'Июль', 8 => 'Август',
            9 => 'Сентябрь', 10 => 'Октябрь', 11 => 'Ноябрь', 12 => 'Декабрь',
        ];
        return $months[$month] ?? '';
    }

    private function getMonthNameEn(int $month): string
    {
        $months = [
            1 => 'January', 2 => 'February', 3 => 'March', 4 => 'April',
            5 => 'May', 6 => 'June', 7 => 'July', 8 => 'August',
            9 => 'September', 10 => 'October', 11 => 'November', 12 => 'December',
        ];
        return $months[$month] ?? '';
    }
}
