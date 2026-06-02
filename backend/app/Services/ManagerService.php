<?php

namespace App\Services;

use App\Models\User;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;

class ManagerService
{
    /**
     * Доступные разделы для менеджеров
     */
    const AVAILABLE_SECTIONS = [
        'dashboard' => 'Дашборд',
        'news' => 'Новости',
        'restaurants' => 'Рестораны',
        'menu' => 'Меню',
        'pages' => 'Страницы',
        'reviews' => 'Отзывы',
        'orders' => 'Заказы',
    ];

    /**
     * Получить список менеджеров с пагинацией и фильтрацией
     */
    public function getPaginated(array $filters = [], int $perPage = 10): LengthAwarePaginator
    {
        $query = User::where('role', 'manager');

        // Фильтр по статусу
        if (isset($filters['is_active']) && $filters['is_active'] !== '') {
            $query->where('is_active', (bool) $filters['is_active']);
        }

        // Поиск по имени или email
        if (!empty($filters['search'])) {
            $query->where(function ($q) use ($filters) {
                $q->where('name', 'like', '%' . $filters['search'] . '%')
                    ->orWhere('email', 'like', '%' . $filters['search'] . '%');
            });
        }

        // Сортировка
        $sortField = $filters['sort_by'] ?? 'created_at';
        $sortOrder = $filters['sort_order'] ?? 'desc';
        $query->orderBy($sortField, $sortOrder);

        return $query->paginate($perPage);
    }

    /**
     * Получить менеджера по ID
     */
    public function findById(int $id): ?User
    {
        return User::where('role', 'manager')->find($id);
    }

    /**
     * Создать менеджера
     */
    public function create(array $data): User
    {
        return DB::transaction(function () use ($data) {
            $user = new User();
            $user->name = $data['name'];
            $user->email = $data['email'];
            $user->password = Hash::make($data['password']);
            $user->role = 'manager';
            $user->is_active = $data['is_active'] ?? true;
            $user->permissions = $data['permissions'] ?? [];
            $user->save();

            return $user;
        });
    }

    /**
     * Обновить менеджера
     */
    public function update(int $id, array $data): ?User
    {
        $user = $this->findById($id);
        if (!$user) {
            return null;
        }

        return DB::transaction(function () use ($user, $data) {
            $user->name = $data['name'] ?? $user->name;
            $user->email = $data['email'] ?? $user->email;

            if (!empty($data['password'])) {
                $user->password = Hash::make($data['password']);
            }

            if (isset($data['is_active'])) {
                $user->is_active = (bool) $data['is_active'];
            }

            if (isset($data['permissions'])) {
                $user->permissions = $data['permissions'];
            }

            $user->save();

            return $user;
        });
    }

    /**
     * Удалить менеджера
     */
    public function delete(int $id): bool
    {
        $user = $this->findById($id);
        if (!$user) {
            return false;
        }

        // Нельзя удалить самого себя
        if ($user->id === auth()->id()) {
            throw new \Exception('Нельзя удалить свою учётную запись');
        }

        return $user->delete();
    }

    /**
     * Заблокировать/разблокировать менеджера
     */
    public function toggleBlock(int $id): ?User
    {
        $user = $this->findById($id);
        if (!$user) {
            return null;
        }

        // Нельзя заблокировать самого себя
        if ($user->id === auth()->id()) {
            throw new \Exception('Нельзя заблокировать свою учётную запись');
        }

        $user->is_active = !$user->is_active;
        $user->save();

        return $user;
    }

    /**
     * Получить статистику по менеджерам
     */
    public function getStats(): array
    {
        return [
            'total' => User::where('role', 'manager')->count(),
            'active' => User::where('role', 'manager')->where('is_active', true)->count(),
            'blocked' => User::where('role', 'manager')->where('is_active', false)->count(),
        ];
    }

    /**
     * Получить доступные разделы для прав доступа
     */
    public function getAvailableSections(): array
    {
        $result = [];
        foreach (self::AVAILABLE_SECTIONS as $value => $label) {
            $result[] = [
                'value' => $value,
                'label' => $label,
            ];
        }
        return $result;
    }

    /**
     * Получить статусы для фильтрации
     */
    public function getStatuses(): array
    {
        return [
            ['value' => '', 'label' => 'Все'],
            ['value' => '1', 'label' => 'Активен'],
            ['value' => '0', 'label' => 'Заблокирован'],
        ];
    }
}
