<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Resources\ContactMessageResource;
use App\Services\ContactService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AdminContactController extends Controller
{
    public function __construct(
        protected ContactService $contactService
    ) {}

    /**
     * GET /api/admin/contact - список сообщений
     */
    public function index(Request $request): JsonResponse
    {
        $filters = $request->only(['is_read', 'search', 'sort_by', 'sort_order']);
        $perPage = $request->get('per_page', 10);

        $messages = $this->contactService->getPaginated($filters, $perPage);

        return response()->json([
            'success' => true,
            'data' => ContactMessageResource::collection($messages),
            'meta' => [
                'current_page' => $messages->currentPage(),
                'last_page' => $messages->lastPage(),
                'per_page' => $messages->perPage(),
                'total' => $messages->total(),
            ],
            'stats' => $this->contactService->getStats(),
        ]);
    }

    /**
     * GET /api/admin/contact/{id} - детально
     */
    public function show(int $id): JsonResponse
    {
        $message = $this->contactService->findById($id);

        if (!$message) {
            return response()->json([
                'success' => false,
                'message' => 'Сообщение не найдено',
            ], 404);
        }

        // Автоматически отмечаем как прочитанное при просмотре
        if (!$message->is_read) {
            $this->contactService->markAsRead($id);
            $message->refresh();
        }

        return response()->json([
            'success' => true,
            'data' => new ContactMessageResource($message),
        ]);
    }

    /**
     * PATCH /api/admin/contact/{id}/read - отметить как прочитанное
     */
    public function markAsRead(int $id): JsonResponse
    {
        $message = $this->contactService->markAsRead($id);

        if (!$message) {
            return response()->json([
                'success' => false,
                'message' => 'Сообщение не найдено',
            ], 404);
        }

        return response()->json([
            'success' => true,
            'message' => 'Сообщение отмечено как прочитанное',
            'data' => new ContactMessageResource($message),
        ]);
    }

    /**
     * DELETE /api/admin/contact/{id} - удалить
     */
    public function destroy(int $id): JsonResponse
    {
        $deleted = $this->contactService->delete($id);

        if (!$deleted) {
            return response()->json([
                'success' => false,
                'message' => 'Сообщение не найдено',
            ], 404);
        }

        return response()->json([
            'success' => true,
            'message' => 'Сообщение успешно удалено',
        ]);
    }

    /**
     * GET /api/admin/contact/stats - статистика
     */
    public function stats(): JsonResponse
    {
        return response()->json([
            'success' => true,
            'data' => $this->contactService->getStats(),
        ]);
    }
}
