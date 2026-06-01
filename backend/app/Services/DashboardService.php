<?php

namespace App\Services;

use App\Models\Booking;
use App\Models\EventRequest;
use App\Models\News;
use App\Models\Restaurant;
use App\Models\Review;
use App\Models\MenuItem;
use App\Models\ContactMessage;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class DashboardService
{
    /**
     * Получить всю статистику для дашборда
     */
    public function getStats(): array
    {
        return [
            'news' => $this->getNewsStats(),
            'restaurants' => $this->getRestaurantsStats(),
            'menu' => $this->getMenuStats(),
            'reviews' => $this->getReviewsStats(),
            'orders' => $this->getOrdersStats(),
            'messages' => $this->getMessagesStats(),
        ];
    }

    /**
     * Статистика по новостям
     */
    private function getNewsStats(): array
    {
        return [
            'total' => News::count(),
            'published' => News::where('status', 'published')->count(),
            'draft' => News::where('status', 'draft')->count(),
        ];
    }

    /**
     * Статистика по ресторанам
     */
    private function getRestaurantsStats(): array
    {
        return [
            'total' => Restaurant::count(),
            'active' => Restaurant::where('status', 'active')->count(),
            'inactive' => Restaurant::where('status', 'inactive')->count(),
        ];
    }

    /**
     * Статистика по меню
     */
    private function getMenuStats(): array
    {
        return [
            'total_dishes' => MenuItem::count(),
            'active_dishes' => MenuItem::where('is_active', true)->count(),
            'featured_dishes' => MenuItem::where('is_featured', true)->count(),
            'categories_count' => DB::table('menu_categories')->count(),
        ];
    }

    /**
     * Статистика по отзывам
     */
    private function getReviewsStats(): array
    {
        return [
            'total' => Review::count(),
            'pending' => Review::where('status', 'pending')->count(),
            'approved' => Review::where('status', 'approved')->count(),
            'rejected' => Review::where('status', 'rejected')->count(),
            'average_rating' => Review::where('status', 'approved')->avg('rating') ?? 0,
        ];
    }

    /**
     * Статистика по заказам (брони + мероприятия)
     */
    private function getOrdersStats(): array
    {
        $bookings = [
            'total' => Booking::count(),
            'new' => Booking::where('status', 'new')->count(),
            'processing' => Booking::where('status', 'processing')->count(),
            'confirmed' => Booking::where('status', 'confirmed')->count(),
            'cancelled' => Booking::where('status', 'cancelled')->count(),
        ];

        $events = [
            'total' => EventRequest::count(),
            'new' => EventRequest::where('status', 'new')->count(),
            'processing' => EventRequest::where('status', 'processing')->count(),
            'confirmed' => EventRequest::where('status', 'confirmed')->count(),
            'cancelled' => EventRequest::where('status', 'cancelled')->count(),
        ];

        return [
            'bookings' => $bookings,
            'events' => $events,
            'total_orders' => $bookings['total'] + $events['total'],
            'new_orders' => $bookings['new'] + $events['new'],
        ];
    }

    /**
     * Статистика по сообщениям из контактов
     */
    private function getMessagesStats(): array
    {
        return [
            'total' => ContactMessage::count(),
            'unread' => ContactMessage::where('is_read', false)->count(),
            'read' => ContactMessage::where('is_read', true)->count(),
        ];
    }

    /**
     * Получить последние заказы (для виджета на дашборде)
     */
    public function getRecentOrders(int $limit = 5): array
    {
        $bookings = Booking::with('restaurant')
            ->latest()
            ->limit($limit)
            ->get()
            ->map(fn($b) => [
                'id' => 'BK-' . str_pad($b->id, 6, '0', STR_PAD_LEFT),
                'type' => 'booking',
                'type_label' => 'Бронирование столика',
                'client' => $b->client_name,
                'restaurant' => $b->restaurant?->name_ru,
                'date' => $b->date->format('Y-m-d'),
                'status' => $b->status,
                'amount' => null,
            ]);

        $events = EventRequest::with('restaurant')
            ->latest()
            ->limit($limit)
            ->get()
            ->map(fn($e) => [
                'id' => 'EV-' . str_pad($e->id, 6, '0', STR_PAD_LEFT),
                'type' => 'event',
                'type_label' => 'Мероприятие',
                'client' => $e->client_name,
                'restaurant' => $e->restaurant?->name_ru,
                'date' => $e->date->format('Y-m-d'),
                'status' => $e->status,
                'amount' => $e->total_price,
            ]);

        return $bookings->concat($events)
            ->sortByDesc(fn($item) => $item['date'])
            ->take($limit)
            ->values()
            ->toArray();
    }

    /**
     * Получить последние отзывы на модерации
     */
    public function getPendingReviews(int $limit = 5): array
    {
        return Review::where('status', 'pending')
            ->latest()
            ->limit($limit)
            ->get()
            ->map(fn($r) => [
                'id' => $r->id,
                'name' => $r->name,
                'rating' => $r->rating,
                'text' => Str::limit($r->text_ru, 100),
                'date' => $r->created_at->format('d.m.Y'),
            ])
            ->toArray();
    }

    /**
     * Быстрые действия (кнопки на дашборде)
     */
    public function getQuickActions(): array
    {
        return [
            [
                'label' => 'Добавить новость',
                'icon' => '📰',
                'url' => '/admin/news?action=create',
                'permission' => 'news',
            ],
            [
                'label' => 'Добавить блюдо',
                'icon' => '🍽️',
                'url' => '/admin/menu?action=create',
                'permission' => 'menu',
            ],
            [
                'label' => 'Проверить отзывы',
                'icon' => '⭐',
                'url' => '/admin/reviews?filter=pending',
                'permission' => 'reviews',
                'badge' => Review::where('status', 'pending')->count(),
            ],
            [
                'label' => 'Новые заказы',
                'icon' => '📞',
                'url' => '/admin/orders?filter=new',
                'permission' => 'orders',
                'badge' => Booking::where('status', 'new')->count() + EventRequest::where('status', 'new')->count(),
            ],
        ];
    }
}
