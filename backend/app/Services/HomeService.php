<?php

namespace App\Services;

use App\Models\News;
use App\Models\Restaurant;
use App\Models\MenuItem;
use Illuminate\Support\Facades\Cache;

class HomeService
{
    /**
     * Получить динамические данные для главной страницы
     */
    public function getHomeData(string $lang = 'ru'): array
    {
        $cacheKey = 'home_data_' . $lang;

        return Cache::remember($cacheKey, 600, function () use ($lang) {
            return [
                'slides' => $this->getHeroSlides($lang),
                'latest_news' => $this->getLatestNews($lang, 3),
                'featured_dishes' => $this->getFeaturedDishes($lang),
            ];
        });
    }

    /**
     * Слайды для слайдера (из активных ресторанов)
     */
    private function getHeroSlides(string $lang): array
    {
        $restaurants = Restaurant::where('status', 'active')
            ->with('galleries')
            ->orderBy('order')
            ->get();

        return $restaurants->map(function ($restaurant) use ($lang) {
            return [
                'id' => $restaurant->id,
                'title' => $lang === 'ru' ? $restaurant->name_ru : ($restaurant->name_en ?? $restaurant->name_ru),
                'subtitle' => $lang === 'ru' ? $restaurant->description_ru : ($restaurant->description_en ?? $restaurant->description_ru),
                'image' => $restaurant->galleries->first()?->image_url,
                'link' => [
                    'href' => '/restaurants/' . $restaurant->id,
                    'label' => $lang === 'ru' ? 'Подробнее' : 'Details',
                ],
            ];
        })->toArray();
    }

    /**
     * Последние новости
     */
    private function getLatestNews(string $lang, int $limit): array
    {
        $news = News::where('status', 'published')
            ->whereNotNull('published_at')
            ->orderBy('published_at', 'desc')
            ->limit($limit)
            ->get();

        return $news->map(function ($item) use ($lang) {
            return [
                'id' => $item->id,
                'title' => $lang === 'ru' ? $item->title_ru : ($item->title_en ?? $item->title_ru),
                'excerpt' => $lang === 'ru' ? $item->excerpt_ru : ($item->excerpt_en ?? $item->excerpt_ru),
                'image_thumb' => $item->image_thumb,
                'date' => $item->published_at?->format('d.m.Y'),
                'url' => '/news/' . $item->id,
            ];
        })->toArray();
    }

    /**
     * Рекомендуемые блюда
     */
    private function getFeaturedDishes(string $lang, int $limit = 6): array
    {
        $dishes = MenuItem::where('is_active', true)
            ->where('is_featured', true)
            ->orderBy('order')
            ->limit($limit)
            ->get();

        return $dishes->map(function ($item) use ($lang) {
            return [
                'id' => $item->id,
                'title' => $lang === 'ru' ? $item->title_ru : ($item->title_en ?? $item->title_ru),
                'description' => $lang === 'ru' ? $item->description_ru : ($item->description_en ?? $item->description_ru),
                'price' => $item->price,
                'price_formatted' => number_format($item->price, 0, ',', ' ') . ' ₽',
                'image' => $item->image,
                'category_id' => $item->category_id,
            ];
        })->toArray();
    }

    /**
     * Очистка кеша главной страницы
     */
    public function clearCache(): void
    {
        Cache::forget('home_data_ru');
        Cache::forget('home_data_en');
    }
}
