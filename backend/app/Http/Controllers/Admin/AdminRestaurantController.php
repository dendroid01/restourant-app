<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\RestaurantRequest;
use App\Http\Resources\RestaurantListResource;
use App\Http\Resources\RestaurantResource;
use App\Services\RestaurantService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AdminRestaurantController extends Controller
{
    public function __construct(
        protected RestaurantService $restaurantService
    ) {}

    /**
     * GET /api/admin/restaurants - список ресторанов
     */
    public function index(Request $request): JsonResponse
    {
        $filters = $request->only(['status', 'search', 'sort_by', 'sort_order']);
        $perPage = $request->get('per_page', 10);

        $restaurants = $this->restaurantService->getPaginated($filters, $perPage);

        return response()->json([
            'success' => true,
            'data' => RestaurantListResource::collection($restaurants),
            'meta' => [
                'current_page' => $restaurants->currentPage(),
                'last_page' => $restaurants->lastPage(),
                'per_page' => $restaurants->perPage(),
                'total' => $restaurants->total(),
            ],
            'statuses' => $this->restaurantService->getStatuses(),
        ]);
    }

    /**
     * GET /api/admin/restaurants/all - все активные (для select)
     */
    public function all(): JsonResponse
    {
        $restaurants = $this->restaurantService->getAllActive();

        return response()->json([
            'success' => true,
            'data' => $restaurants,
        ]);
    }

    /**
     * GET /api/admin/restaurants/{id} - детально
     */
    public function show(int $id): JsonResponse
    {
        $restaurant = $this->restaurantService->findById($id);

        if (!$restaurant) {
            return response()->json([
                'success' => false,
                'message' => 'Ресторан не найден',
            ], 404);
        }

        return response()->json([
            'success' => true,
            'data' => new RestaurantResource($restaurant),
        ]);
    }

    /**
     * POST /api/admin/restaurants - создать
     */
    public function store(RestaurantRequest $request): JsonResponse
    {
        $data = $request->validated();
        $restaurant = $this->restaurantService->create($data);

        return response()->json([
            'success' => true,
            'message' => 'Ресторан успешно создан',
            'data' => new RestaurantResource($restaurant),
        ], 201);
    }

    /**
     * PUT /api/admin/restaurants/{id} - обновить
     */
    public function update(RestaurantRequest $request, int $id): JsonResponse
    {
        $data = $request->validated();
        $restaurant = $this->restaurantService->update($id, $data);

        if (!$restaurant) {
            return response()->json([
                'success' => false,
                'message' => 'Ресторан не найден',
            ], 404);
        }

        return response()->json([
            'success' => true,
            'message' => 'Ресторан успешно обновлён',
            'data' => new RestaurantResource($restaurant),
        ]);
    }

    /**
     * DELETE /api/admin/restaurants/{id} - удалить
     */
    public function destroy(int $id): JsonResponse
    {
        $deleted = $this->restaurantService->delete($id);

        if (!$deleted) {
            return response()->json([
                'success' => false,
                'message' => 'Ресторан не найден',
            ], 404);
        }

        return response()->json([
            'success' => true,
            'message' => 'Ресторан успешно удалён',
        ]);
    }

    /**
     * POST /api/admin/restaurants/reorder - обновить порядок
     */
    public function reorder(Request $request): JsonResponse
    {
        $request->validate([
            'orders' => ['required', 'array'],
            'orders.*.id' => ['required', 'integer', 'exists:restaurants,id'],
            'orders.*.order' => ['required', 'integer', 'min:0'],
        ]);

        $this->restaurantService->updateOrder($request->orders);

        return response()->json([
            'success' => true,
            'message' => 'Порядок ресторанов обновлён',
        ]);
    }

    /**
     * GET /api/admin/restaurants/statuses - список статусов
     */
    public function statuses(): JsonResponse
    {
        return response()->json([
            'success' => true,
            'data' => $this->restaurantService->getStatuses(),
        ]);
    }
}
