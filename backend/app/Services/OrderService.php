<?php

namespace App\Services;

use App\Models\Booking;
use App\Models\EventRequest;
use App\Models\EventRequestItem;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;
use App\Models\MenuItem;

class OrderService
{
    /**
     * Получить список всех заказов (брони + мероприятия) с пагинацией и фильтрацией
     */
    public function getPaginated(array $filters = [], int $perPage = 10): LengthAwarePaginator
    {
        $bookings = $this->getFilteredBookings($filters);
        $events = $this->getFilteredEvents($filters);

        // Объединяем коллекции
        $orders = $bookings->concat($events);

        // Сортировка
        $sortField = $filters['sort_by'] ?? 'date';
        $sortOrder = $filters['sort_order'] ?? 'desc';

        $orders = $sortOrder === 'asc'
            ? $orders->sortBy($sortField)
            : $orders->sortByDesc($sortField);

        // Пагинация вручную (так как объединённая коллекция)
        $currentPage = request()->get('page', 1);
        $offset = ($currentPage - 1) * $perPage;

        $paginatedItems = $orders->slice($offset, $perPage)->values();

        return new LengthAwarePaginator(
            $paginatedItems,
            $orders->count(),
            $perPage,
            $currentPage,
            ['path' => request()->url(), 'query' => request()->query()]
        );
    }

    /**
     * Получить отфильтрованные брони
     */
// app/Services/OrderService.php - исправляем метод getFilteredBookings
    private function getFilteredBookings(array $filters): Collection
    {
        $query = Booking::with('restaurant');

        // Фильтр по типу
        if (!empty($filters['type']) && $filters['type'] !== 'all') {
            if ($filters['type'] === 'event') {
                return collect();
            }
        }

        // Фильтр по статусу
        if (!empty($filters['status']) && $filters['status'] !== 'all') {
            $query->where('status', $filters['status']);
        }

        // Фильтр по ресторану (по ID, не по названию!)
        if (!empty($filters['restaurant_id'])) {
            $query->where('restaurant_id', $filters['restaurant_id']);
        }

        // Фильтр по дате
        if (!empty($filters['date_from'])) {
            $query->whereDate('date', '>=', $filters['date_from']);
        }
        if (!empty($filters['date_to'])) {
            $query->whereDate('date', '<=', $filters['date_to']);
        }

        // Поиск
        if (!empty($filters['search'])) {
            $query->where(function ($q) use ($filters) {
                $q->where('client_name', 'like', '%' . $filters['search'] . '%')
                    ->orWhere('phone', 'like', '%' . $filters['search'] . '%')
                    ->orWhere('email', 'like', '%' . $filters['search'] . '%');
            });
        }

        $bookings = $query->get()->map(function ($booking) {
            return [
                'id' => 'BK-' . str_pad($booking->id, 6, '0', STR_PAD_LEFT),
                'original_id' => $booking->id,
                'type' => 'booking',
                'type_label' => 'Бронирование столика',
                'type_icon' => 'table',
                'client_name' => $booking->client_name,
                'phone' => $booking->phone,
                'email' => $booking->email,
                'restaurant_id' => $booking->restaurant_id,
                'restaurant_name' => $booking->restaurant?->name_ru,
                'date' => $booking->date instanceof \DateTime ? $booking->date->format('Y-m-d') : $booking->date,
                'time' => $booking->time instanceof \DateTime ? $booking->time->format('H:i') : $booking->time,
                'guests' => $booking->guests,
                'wishes' => $booking->wishes,
                'status' => $booking->status,
                'amount' => null,
                'amount_per_person' => null,
                'admin_comment' => $booking->admin_comment,
                'created_at' => $booking->created_at,
            ];
        });

        return $bookings;
    }

    /**
     * Получить отфильтрованные мероприятия
     */
    private function getFilteredEvents(array $filters): Collection
    {
        $query = EventRequest::with(['restaurant', 'items.menuItem']);

        // Фильтр по типу
        if (!empty($filters['type']) && $filters['type'] !== 'all') {
            if ($filters['type'] === 'booking') {
                return collect(); // не возвращаем мероприятия
            }
        }

        // Фильтр по статусу
        if (!empty($filters['status']) && $filters['status'] !== 'all') {
            $query->where('status', $filters['status']);
        }

        // Фильтр по ресторану
        if (!empty($filters['restaurant_id'])) {
            $query->where('restaurant_id', $filters['restaurant_id']);
        }

        // Фильтр по дате
        if (!empty($filters['date_from'])) {
            $query->whereDate('date', '>=', $filters['date_from']);
        }
        if (!empty($filters['date_to'])) {
            $query->whereDate('date', '<=', $filters['date_to']);
        }

        // Поиск по клиенту
        if (!empty($filters['search'])) {
            $query->where(function ($q) use ($filters) {
                $q->where('client_name', 'like', '%' . $filters['search'] . '%')
                    ->orWhere('phone', 'like', '%' . $filters['search'] . '%')
                    ->orWhere('email', 'like', '%' . $filters['search'] . '%');
            });
        }

        // app/Services/OrderService.php - метод getFilteredEvents
        $events = $query->get()->map(function ($event) {
            return [
                'id' => 'EV-' . str_pad($event->id, 6, '0', STR_PAD_LEFT),
                'original_id' => $event->id,
                'type' => 'event',
                'type_label' => 'Мероприятие',
                'type_icon' => 'event',
                'client_name' => $event->client_name,
                'phone' => $event->phone,
                'email' => $event->email,
                'restaurant_id' => $event->restaurant_id,
                'restaurant_name' => $event->restaurant?->name_ru,
                'date' => $event->date instanceof \DateTime ? $event->date->format('Y-m-d') : $event->date,
                'guests' => $event->guests,
                'wishes' => $event->wishes,
                'status' => $event->status,
                'amount' => $event->total_price,
                'amount_per_person' => $event->total_price_per_person,
                'admin_comment' => $event->admin_comment,
                'items' => $event->items->map(function ($item) {
                    return [
                        'id' => $item->id,
                        'menu_item_id' => $item->menu_item_id,
                        'title_ru' => $item->menuItem?->title_ru,
                        'title_en' => $item->menuItem?->title_en,
                        'price' => $item->menuItem?->price,
                        'quantity' => $item->quantity,
                        'subtotal' => ($item->menuItem?->price ?? 0) * $item->quantity,
                    ];
                }),
                'created_at' => $event->created_at,
            ];
        });

        return $events;
    }

    /**
     * Получить заказ по ID и типу
     */
    public function findById(string $type, int $id): ?array
    {
// app/Services/OrderService.php - метод findById для booking
        if ($type === 'booking') {
            $booking = Booking::with('restaurant')->find($id);
            if (!$booking) return null;

            return [
                'id' => 'BK-' . str_pad($booking->id, 6, '0', STR_PAD_LEFT),
                'original_id' => $booking->id,
                'type' => 'booking',
                'type_label' => 'Бронирование столика',
                'client_name' => $booking->client_name,
                'phone' => $booking->phone,
                'email' => $booking->email,
                'restaurant_id' => $booking->restaurant_id,
                'restaurant_name' => $booking->restaurant?->name_ru,
                'date' => $booking->date instanceof \DateTime ? $booking->date->format('Y-m-d') : $booking->date,
                'time' => $booking->time instanceof \DateTime ? $booking->time->format('H:i') : $booking->time,
                'guests' => $booking->guests,
                'wishes' => $booking->wishes,
                'status' => $booking->status,
                'admin_comment' => $booking->admin_comment,
                'created_at' => $booking->created_at,
            ];
        }

        if ($type === 'event') {
            $event = EventRequest::with(['restaurant', 'items.menuItem'])->find($id);
            if (!$event) return null;

            return [
                'id' => 'EV-' . str_pad($event->id, 6, '0', STR_PAD_LEFT),
                'original_id' => $event->id,
                'type' => 'event',
                'type_label' => 'Мероприятие',
                'client_name' => $event->client_name,
                'phone' => $event->phone,
                'email' => $event->email,
                'restaurant_id' => $event->restaurant_id,
                'restaurant_name' => $event->restaurant?->name_ru,
                'date' => $event->date->format('Y-m-d'),
                'guests' => $event->guests,
                'wishes' => $event->wishes,
                'status' => $event->status,
                'amount' => $event->total_price,
                'amount_per_person' => $event->total_price_per_person,
                'admin_comment' => $event->admin_comment,
                'items' => $event->items->map(function ($item) {
                    return [
                        'id' => $item->id,
                        'menu_item_id' => $item->menu_item_id,
                        'title_ru' => $item->menuItem?->title_ru,
                        'price' => $item->menuItem?->price,
                        'quantity' => $item->quantity,
                        'subtotal' => ($item->menuItem?->price ?? 0) * $item->quantity,
                    ];
                }),
                'created_at' => $event->created_at,
            ];
        }

        return null;
    }

    /**
     * Обновить статус заказа
     */
    public function updateStatus(string $type, int $id, string $status): ?array
    {
        $validStatuses = ['new', 'processing', 'confirmed', 'cancelled'];
        if (!in_array($status, $validStatuses)) {
            throw new \InvalidArgumentException('Некорректный статус');
        }

        if ($type === 'booking') {
            $booking = Booking::find($id);
            if (!$booking) return null;

            $booking->status = $status;
            $booking->save();

            return $this->findById('booking', $id);
        }

        if ($type === 'event') {
            $event = EventRequest::find($id);
            if (!$event) return null;

            $event->status = $status;
            $event->save();

            return $this->findById('event', $id);
        }

        return null;
    }

    /**
     * Обновить заказ (полные данные)
     */
    public function update(string $type, int $id, array $data): ?array
    {
        if ($type === 'booking') {
            $booking = Booking::find($id);
            if (!$booking) return null;

            $booking->update([
                'client_name' => $data['client_name'] ?? $booking->client_name,
                'phone' => $data['phone'] ?? $booking->phone,
                'email' => $data['email'] ?? $booking->email,
                'restaurant_id' => $data['restaurant_id'] ?? $booking->restaurant_id,
                'date' => $data['date'] ?? $booking->date,
                'time' => $data['time'] ?? $booking->time,
                'guests' => $data['guests'] ?? $booking->guests,
                'wishes' => $data['wishes'] ?? $booking->wishes,
                'status' => $data['status'] ?? $booking->status,
                'admin_comment' => $data['admin_comment'] ?? $booking->admin_comment,
            ]);

            return $this->findById('booking', $id);
        }

        if ($type === 'event') {
            $event = EventRequest::find($id);
            if (!$event) return null;

            $event->update([
                'client_name' => $data['client_name'] ?? $event->client_name,
                'phone' => $data['phone'] ?? $event->phone,
                'email' => $data['email'] ?? $event->email,
                'restaurant_id' => $data['restaurant_id'] ?? $event->restaurant_id,
                'date' => $data['date'] ?? $event->date,
                'guests' => $data['guests'] ?? $event->guests,
                'wishes' => $data['wishes'] ?? $event->wishes,
                'status' => $data['status'] ?? $event->status,
                'admin_comment' => $data['admin_comment'] ?? $event->admin_comment,
            ]);

            return $this->findById('event', $id);
        }

        return null;
    }

    /**
     * Получить статистику по заказам
     */
    public function getStats(): array
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
     * Получить статусы для select
     */
    public function getStatuses(): array
    {
        return [
            ['value' => 'all', 'label' => 'Все'],
            ['value' => 'new', 'label' => 'Новая'],
            ['value' => 'processing', 'label' => 'В обработке'],
            ['value' => 'confirmed', 'label' => 'Подтверждена'],
            ['value' => 'cancelled', 'label' => 'Отменена'],
        ];
    }

    /**
     * Получить типы заказов для select
     */
    public function getTypes(): array
    {
        return [
            ['value' => 'all', 'label' => 'Все'],
            ['value' => 'booking', 'label' => 'Бронирование столика'],
            ['value' => 'event', 'label' => 'Мероприятие'],
        ];
    }

    public function delete(string $type, int $id): bool
    {
        if ($type === 'booking') {
            $booking = Booking::find($id);
            if (!$booking) return false;

            return $booking->delete();
        }

        if ($type === 'event') {
            $event = EventRequest::find($id);
            if (!$event) return false;

            // Удаляем связанные позиции
            $event->items()->delete();

            return $event->delete();
        }

        return false;
    }

    public function addEventItem(int $eventId, array $data): ?array
    {
        $event = EventRequest::find($eventId);
        if (!$event) return null;

        $menuItem = MenuItem::find($data['menu_item_id']);
        if (!$menuItem) throw new \InvalidArgumentException('Блюдо не найдено');

        $item = EventRequestItem::create([
            'event_request_id' => $eventId,
            'menu_item_id' => $data['menu_item_id'],
            'quantity' => $data['quantity'],
        ]);

        // Пересчитываем общую сумму
        $event->recalculateTotal();
        $event->save();

        return $this->findById('event', $eventId);
    }

    /**
     * Обновить позицию в заказе мероприятия
     */
    public function updateEventItem(int $eventId, int $itemId, array $data): ?array
    {
        $event = EventRequest::find($eventId);
        if (!$event) return null;

        $item = EventRequestItem::where('event_request_id', $eventId)
            ->where('id', $itemId)
            ->first();

        if (!$item) throw new \InvalidArgumentException('Позиция не найдена');

        if (isset($data['quantity'])) {
            $item->quantity = $data['quantity'];
            $item->save();
        }

        // Пересчитываем общую сумму
        $event->recalculateTotal();
        $event->save();

        return $this->findById('event', $eventId);
    }

    /**
     * Удалить позицию из заказа мероприятия
     */
    public function deleteEventItem(int $eventId, int $itemId): ?array
    {
        $event = EventRequest::find($eventId);
        if (!$event) return null;

        $item = EventRequestItem::where('event_request_id', $eventId)
            ->where('id', $itemId)
            ->first();

        if (!$item) throw new \InvalidArgumentException('Позиция не найдена');

        $item->delete();

        // Пересчитываем общую сумму
        $event->recalculateTotal();
        $event->save();

        return $this->findById('event', $eventId);
    }

    /**
     * Получить доступные блюда для добавления в мероприятие
     */
    public function getAvailableDishesForEvent(int $eventId): array
    {
        $event = EventRequest::find($eventId);
        if (!$event) return [];

        // Получаем уже добавленные блюда
        $existingItemIds = $event->items->pluck('menu_item_id')->toArray();

        // Получаем доступные блюда для мероприятий
        $availableDishes = MenuItem::where('is_available_for_events', true)
            ->where('is_active', true)
            ->whereNotIn('id', $existingItemIds)
            ->get()
            ->map(function ($item) {
                return [
                    'id' => $item->id,
                    'title_ru' => $item->title_ru,
                    'title_en' => $item->title_en,
                    'price' => $item->price,
                    'price_formatted' => number_format($item->price, 0, ',', ' ') . ' ₽',
                ];
            });

        return $availableDishes->toArray();
    }
}
