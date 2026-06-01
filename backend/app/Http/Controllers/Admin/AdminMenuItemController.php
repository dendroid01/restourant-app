<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\MenuItemRequest;
use App\Http\Resources\MenuItemListResource;
use App\Http\Resources\MenuItemResource;
use App\Services\MenuItemService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AdminMenuItemController extends Controller
{
    public function __construct(
        protected MenuItemService $menuItemService
    ) {}

    /**
     * GET /api/admin/menu/items - список блюд
     */
    public function index(Request $request): JsonResponse
    {
        $filters = $request->only([
            'category_id', 'is_active', 'is_featured',
            'is_available_for_events', 'search', 'sort_by', 'sort_order'
        ]);
        $perPage = $request->get('per_page', 10);

        $items = $this->menuItemService->getPaginated($filters, $perPage);

        return response()->json([
            'success' => true,
            'data' => MenuItemListResource::collection($items),
            'meta' => [
                'current_page' => $items->currentPage(),
                'last_page' => $items->lastPage(),
                'per_page' => $items->perPage(),
                'total' => $items->total(),
            ],
            'stats' => $this->menuItemService->getStats(),
            'filter_options' => $this->menuItemService->getFilterOptions(),
        ]);
    }

    /**
     * GET /api/admin/menu/items/event-dishes - блюда для калькулятора мероприятий
     */
    public function eventDishes(): JsonResponse
    {
        $dishes = $this->menuItemService->getEventDishes();

        return response()->json([
            'success' => true,
            'data' => $dishes,
        ]);
    }

    /**
     * GET /api/admin/menu/items/featured - рекомендуемые блюда
     */
    public function featured(Request $request): JsonResponse
    {
        $limit = $request->get('limit', 10);
        $dishes = $this->menuItemService->getFeaturedDishes($limit);

        return response()->json([
            'success' => true,
            'data' => $dishes,
        ]);
    }

    /**
     * GET /api/admin/menu/items/{id} - детально
     */
    public function show(int $id): JsonResponse
    {
        $item = $this->menuItemService->findById($id);

        if (!$item) {
            return response()->json([
                'success' => false,
                'message' => 'Блюдо не найдено',
            ], 404);
        }

        return response()->json([
            'success' => true,
            'data' => new MenuItemResource($item),
        ]);
    }

    /**
     * POST /api/admin/menu/items - создать
     */
    public function store(MenuItemRequest $request): JsonResponse
    {
        $data = $request->validated();
        $item = $this->menuItemService->create($data);

        return response()->json([
            'success' => true,
            'message' => 'Блюдо успешно создано',
            'data' => new MenuItemResource($item),
        ], 201);
    }

    /**
     * PUT /api/admin/menu/items/{id} - обновить
     */
    public function update(MenuItemRequest $request, int $id): JsonResponse
    {
        $data = $request->validated();
        $item = $this->menuItemService->update($id, $data);

        if (!$item) {
            return response()->json([
                'success' => false,
                'message' => 'Блюдо не найдено',
            ], 404);
        }

        return response()->json([
            'success' => true,
            'message' => 'Блюдо успешно обновлено',
            'data' => new MenuItemResource($item),
        ]);
    }

    /**
     * DELETE /api/admin/menu/items/{id} - удалить
     */
    public function destroy(int $id): JsonResponse
    {
        $deleted = $this->menuItemService->delete($id);

        if (!$deleted) {
            return response()->json([
                'success' => false,
                'message' => 'Блюдо не найдено',
            ], 404);
        }

        return response()->json([
            'success' => true,
            'message' => 'Блюдо успешно удалено',
        ]);
    }

    /**
     * POST /api/admin/menu/items/bulk/status - массовое обновление статуса
     */
    public function bulkUpdateStatus(Request $request): JsonResponse
    {
        $request->validate([
            'ids' => ['required', 'array'],
            'ids.*' => ['required', 'integer', 'exists:menu_items,id'],
            'is_active' => ['required', 'boolean'],
        ]);

        $count = $this->menuItemService->bulkUpdateStatus($request->ids, $request->is_active);

        return response()->json([
            'success' => true,
            'message' => "Обновлено {$count} блюд",
        ]);
    }

    /**
     * POST /api/admin/menu/items/bulk/featured - массовое обновление "рекомендуемое"
     */
    public function bulkUpdateFeatured(Request $request): JsonResponse
    {
        $request->validate([
            'ids' => ['required', 'array'],
            'ids.*' => ['required', 'integer', 'exists:menu_items,id'],
            'is_featured' => ['required', 'boolean'],
        ]);

        $count = $this->menuItemService->bulkUpdateFeatured($request->ids, $request->is_featured);

        return response()->json([
            'success' => true,
            'message' => "Обновлено {$count} блюд",
        ]);
    }

    /**
     * POST /api/admin/menu/items/reorder - обновить порядок
     */
    public function reorder(Request $request): JsonResponse
    {
        $request->validate([
            'orders' => ['required', 'array'],
            'orders.*.id' => ['required', 'integer', 'exists:menu_items,id'],
            'orders.*.order' => ['nullable', 'integer', 'min:0'],
        ]);

        $this->menuItemService->updateOrder($request->orders);

        return response()->json([
            'success' => true,
            'message' => 'Порядок блюд обновлён',
        ]);
    }

    /**
     * GET /api/admin/menu/items/stats - статистика
     */
    public function stats(): JsonResponse
    {
        return response()->json([
            'success' => true,
            'data' => $this->menuItemService->getStats(),
        ]);
    }
}
