<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Restaurant;
use App\Http\Requests\Admin\OrderStatusRequest;
use App\Http\Requests\Admin\OrderUpdateRequest;
use App\Http\Resources\OrderResource;
use App\Services\OrderService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AdminOrderController extends Controller
{
    public function __construct(
        protected OrderService $orderService
    ) {}

    /**
     * GET /api/admin/orders - список заказов
     */
    public function index(Request $request): JsonResponse
    {
        $filters = $request->only([
            'type', 'status', 'restaurant_id', 'date_from', 'date_to', 'search', 'sort_by', 'sort_order'
        ]);
        $perPage = $request->get('per_page', 10);

        $orders = $this->orderService->getPaginated($filters, $perPage);

        return response()->json([
            'success' => true,
            'data' => OrderResource::collection($orders),
            'meta' => [
                'current_page' => $orders->currentPage(),
                'last_page' => $orders->lastPage(),
                'per_page' => $orders->perPage(),
                'total' => $orders->total(),
            ],
            'stats' => $this->orderService->getStats(),
            'statuses' => $this->orderService->getStatuses(),
            'types' => $this->orderService->getTypes(),
        ]);
    }

    /**
     * GET /api/admin/orders/{type}/{id} - детально
     */
    public function show(string $type, int $id): JsonResponse
    {
        if (!in_array($type, ['booking', 'event'])) {
            return response()->json([
                'success' => false,
                'message' => 'Некорректный тип заказа',
            ], 400);
        }

        $order = $this->orderService->findById($type, $id);

        if (!$order) {
            return response()->json([
                'success' => false,
                'message' => 'Заказ не найден',
            ], 404);
        }

        return response()->json([
            'success' => true,
            'data' => new OrderResource($order),
        ]);
    }

    /**
     * PATCH /api/admin/orders/{type}/{id}/status - обновить статус
     */
    public function updateStatus(OrderStatusRequest $request, string $type, int $id): JsonResponse
    {
        if (!in_array($type, ['booking', 'event'])) {
            return response()->json([
                'success' => false,
                'message' => 'Некорректный тип заказа',
            ], 400);
        }

        $order = $this->orderService->updateStatus($type, $id, $request->status);

        if (!$order) {
            return response()->json([
                'success' => false,
                'message' => 'Заказ не найден',
            ], 404);
        }

        return response()->json([
            'success' => true,
            'message' => 'Статус заказа обновлён',
            'data' => new OrderResource($order),
        ]);
    }

    /**
     * PUT /api/admin/orders/{type}/{id} - обновить заказ
     */
    public function update(OrderUpdateRequest $request, string $type, int $id): JsonResponse
    {
        if (!in_array($type, ['booking', 'event'])) {
            return response()->json([
                'success' => false,
                'message' => 'Некорректный тип заказа',
            ], 400);
        }

        $data = $request->validated();
        $order = $this->orderService->update($type, $id, $data);

        if (!$order) {
            return response()->json([
                'success' => false,
                'message' => 'Заказ не найден',
            ], 404);
        }

        return response()->json([
            'success' => true,
            'message' => 'Заказ успешно обновлён',
            'data' => new OrderResource($order),
        ]);
    }

    /**
     * GET /api/admin/orders/stats - статистика
     */
    public function stats(): JsonResponse
    {
        return response()->json([
            'success' => true,
            'data' => $this->orderService->getStats(),
        ]);
    }

    public function listForSelect(): JsonResponse
    {
        $restaurants = Restaurant::where('status', 'active')
            ->orderBy('order')
            ->get(['id', 'name_ru as label']);

        return response()->json([
            'success' => true,
            'data' => $restaurants,
        ]);
    }

    public function destroy(string $type, int $id): JsonResponse
    {
        if (!in_array($type, ['booking', 'event'])) {
            return response()->json([
                'success' => false,
                'message' => 'Некорректный тип заказа',
            ], 400);
        }

        $deleted = $this->orderService->delete($type, $id);

        if (!$deleted) {
            return response()->json([
                'success' => false,
                'message' => 'Заказ не найден',
            ], 404);
        }

        return response()->json([
            'success' => true,
            'message' => 'Заказ успешно удалён',
        ]);
    }

    // app/Http/Controllers/Admin/AdminOrderController.php

    /**
     * POST /api/admin/orders/event/{id}/items - добавить позицию
     */
    public function addEventItem(Request $request, int $id): JsonResponse
    {
        $request->validate([
            'menu_item_id' => ['required', 'integer', 'exists:menu_items,id'],
            'quantity' => ['required', 'integer', 'min:1', 'max:100'],
        ]);

        $order = $this->orderService->addEventItem($id, $request->only(['menu_item_id', 'quantity']));

        if (!$order) {
            return response()->json(['success' => false, 'message' => 'Заказ не найден'], 404);
        }

        return response()->json([
            'success' => true,
            'message' => 'Позиция добавлена',
            'data' => new OrderResource($order),
        ]);
    }

    /**
     * PUT /api/admin/orders/event/{eventId}/items/{itemId} - обновить позицию
     */
    public function updateEventItem(Request $request, int $eventId, int $itemId): JsonResponse
    {
        $request->validate([
            'quantity' => ['required', 'integer', 'min:0', 'max:100'],
        ]);

        $order = $this->orderService->updateEventItem($eventId, $itemId, $request->only(['quantity']));

        if (!$order) {
            return response()->json(['success' => false, 'message' => 'Заказ не найден'], 404);
        }

        return response()->json([
            'success' => true,
            'message' => 'Позиция обновлена',
            'data' => new OrderResource($order),
        ]);
    }

    /**
     * DELETE /api/admin/orders/event/{eventId}/items/{itemId} - удалить позицию
     */
    public function deleteEventItem(int $eventId, int $itemId): JsonResponse
    {
        $order = $this->orderService->deleteEventItem($eventId, $itemId);

        if (!$order) {
            return response()->json(['success' => false, 'message' => 'Заказ не найден'], 404);
        }

        return response()->json([
            'success' => true,
            'message' => 'Позиция удалена',
            'data' => new OrderResource($order),
        ]);
    }

    /**
     * GET /api/admin/orders/event/{id}/available-dishes - доступные блюда
     */
    public function getAvailableDishes(int $id): JsonResponse
    {
        $dishes = $this->orderService->getAvailableDishesForEvent($id);

        return response()->json([
            'success' => true,
            'data' => $dishes,
        ]);
    }
}
