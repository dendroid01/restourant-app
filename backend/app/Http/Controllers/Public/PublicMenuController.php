<?php

namespace App\Http\Controllers\Public;

use App\Http\Controllers\Controller;
use App\Http\Resources\Public\PublicCategoryResource;
use App\Http\Resources\Public\PublicMenuItemResource;
use App\Services\MenuCategoryService;
use App\Services\MenuItemService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class PublicMenuController extends Controller
{
    public function __construct(
        protected MenuCategoryService $categoryService,
        protected MenuItemService $menuItemService
    ) {}

    /**
     * GET /api/menu/categories - дерево категорий с блюдами
     */
    public function categories(): JsonResponse
    {
        $categories = $this->categoryService->getActiveCategoriesWithItems();

        return response()->json([
            'success' => true,
            'data' => PublicCategoryResource::collection($categories),
        ]);
    }

    /**
     * GET /api/menu/items - список блюд с фильтрацией
     */
    public function items(Request $request): JsonResponse
    {
        $filters = $request->only(['category_id', 'category_slug', 'featured', 'search']);
        $items = $this->categoryService->getActiveItems($filters);

        return response()->json([
            'success' => true,
            'data' => PublicMenuItemResource::collection($items),
            'count' => count($items),
        ]);
    }

    /**
     * GET /api/menu/items/featured - рекомендуемые блюда
     */
    public function featured(Request $request): JsonResponse
    {
        $limit = $request->get('limit', 10);
        $items = $this->menuItemService->getFeaturedDishes($limit);

        return response()->json([
            'success' => true,
            'data' => PublicMenuItemResource::collection($items),
        ]);
    }

    /**
     * GET /api/menu/items/event - блюда для калькулятора мероприятий
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
     * GET /api/menu/items/{id} - детально о блюде
     */
    public function show(int $id): JsonResponse
    {
        $item = $this->categoryService->getActiveItem($id);

        if (!$item) {
            return response()->json([
                'success' => false,
                'message' => 'Блюдо не найдено',
            ], 404);
        }

        return response()->json([
            'success' => true,
            'data' => new PublicMenuItemResource($item),
        ]);
    }
}
