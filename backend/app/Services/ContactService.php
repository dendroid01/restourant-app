<?php

namespace App\Services;

use App\Models\ContactMessage;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Mail;

class ContactService
{
    /**
     * Отправить сообщение из формы обратной связи
     */
    public function send(array $data, string $ipAddress): ContactMessage
    {
        return DB::transaction(function () use ($data, $ipAddress) {
            // Сохраняем сообщение в БД
            $message = ContactMessage::create([
                'name' => $data['name'],
                'email' => $data['email'],
                'phone' => $data['phone'] ?? null,
                'message' => $data['message'],
                'is_read' => false,
            ]);

            // TODO: Отправка email-уведомления администратору
            // $this->sendEmailNotification($message);

            return $message;
        });
    }

    /**
     * Получить список сообщений (для админки)
     */
    public function getPaginated(array $filters = [], int $perPage = 10)
    {
        $query = ContactMessage::query();

        // Фильтр по прочитанным/непрочитанным
        if (isset($filters['is_read']) && $filters['is_read'] !== '') {
            $query->where('is_read', (bool) $filters['is_read']);
        }

        // Поиск по имени, email или тексту
        if (!empty($filters['search'])) {
            $query->where(function ($q) use ($filters) {
                $q->where('name', 'like', '%' . $filters['search'] . '%')
                    ->orWhere('email', 'like', '%' . $filters['search'] . '%')
                    ->orWhere('message', 'like', '%' . $filters['search'] . '%');
            });
        }

        // Сортировка
        $sortField = $filters['sort_by'] ?? 'created_at';
        $sortOrder = $filters['sort_order'] ?? 'desc';
        $query->orderBy($sortField, $sortOrder);

        return $query->paginate($perPage);
    }

    /**
     * Получить сообщение по ID
     */
    public function findById(int $id): ?ContactMessage
    {
        return ContactMessage::find($id);
    }

    /**
     * Отметить сообщение как прочитанное
     */
    public function markAsRead(int $id): ?ContactMessage
    {
        $message = $this->findById($id);
        if (!$message) {
            return null;
        }

        $message->is_read = true;
        $message->save();

        return $message;
    }

    /**
     * Удалить сообщение
     */
    public function delete(int $id): bool
    {
        $message = $this->findById($id);
        if (!$message) {
            return false;
        }

        return $message->delete();
    }

    /**
     * Получить статистику по сообщениям
     */
    public function getStats(): array
    {
        return [
            'total' => ContactMessage::count(),
            'unread' => ContactMessage::where('is_read', false)->count(),
            'read' => ContactMessage::where('is_read', true)->count(),
        ];
    }

    /**
     * Отправка email-уведомления (заглушка)
     */
    private function sendEmailNotification(ContactMessage $message): void
    {
        // Реализация будет добавлена позже
        // Mail::to(config('mail.admin_email'))->send(new ContactMessageNotification($message));
    }
}
