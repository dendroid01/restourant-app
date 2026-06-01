<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\MenuCategoryRequest;
use App\Http\Resources\MenuCategoryFlatResource;
use App\Http\Resources\MenuCategoryResource;
use App\Services\MenuCategoryService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;

class AdminMenuCategoryController extends Controller
{
    public function __construct(
        protected MenuCategoryService $categoryService
    ) {}

    /**
     * GET /api/admin/menu/categories - дерево категорий
     */
    public function index(): JsonResponse
    {
        $tree = $this->categoryService->getTree();

        return response()->json([
            'success' => true,
            'data' => MenuCategoryResource::collection($tree),
        ]);
    }

    /**
     * GET /api/admin/menu/categories/flat - плоский список (для select)
     */
    public function flat(): JsonResponse
    {
        $list = $this->categoryService->getFlatList();

        return response()->json([
            'success' => true,
            'data' => MenuCategoryFlatResource::collection($list),
        ]);
    }

    /**
     * GET /api/admin/menu/categories/{id} - детально
     */
    public function show(int $id): JsonResponse
    {
        $category = $this->categoryService->findById($id);

        if (!$category) {
            return response()->json([
                'success' => false,
                'message' => 'Категория не найдена',
            ], 404);
        }

        return response()->json([
            'success' => true,
            'data' => new MenuCategoryResource($category),
        ]);
    }

    /**
     * POST /api/admin/menu/categories - создать
     */
    public function store(MenuCategoryRequest $request): JsonResponse
    {
        $data = $request->validated();
        $category = $this->categoryService->create($data);

        return response()->json([
            'success' => true,
            'message' => 'Категория успешно создана',
            'data' => new MenuCategoryResource($category),
        ], 201);
    }

    /**
     * PUT /api/admin/menu/categories/{id} - обновить
     */
    public function update(MenuCategoryRequest $request, int $id): JsonResponse
    {
        try {
            $data = $request->validated();
            $category = $this->categoryService->update($id, $data);

            if (!$category) {
                return response()->json([
                    'success' => false,
                    'message' => 'Категория не найдена',
                ], 404);
            }

            return response()->json([
                'success' => true,
                'message' => 'Категория успешно обновлена',
                'data' => new MenuCategoryResource($category),
            ]);
        } catch (\Exception $e) {
            throw ValidationException::withMessages([
                'parent_id' => [$e->getMessage()],
            ]);
        }
    }

    /**
     * DELETE /api/admin/menu/categories/{id} - удалить
     */
    public function destroy(int $id): JsonResponse
    {
        try {
            $deleted = $this->categoryService->delete($id);

            if (!$deleted) {
                return response()->json([
                    'success' => false,
                    'message' => 'Категория не найдена',
                ], 404);
            }

            return response()->json([
                'success' => true,
                'message' => 'Категория успешно удалена',
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], 422);
        }
    }

    /**
     * POST /api/admin/menu/categories/reorder - обновить порядок
     */
    public function reorder(Request $request): JsonResponse
    {
        $request->validate([
            'orders' => ['required', 'array'],
            'orders.*.id' => ['required', 'integer', 'exists:menu_categories,id'],
            'orders.*.order' => ['nullable', 'integer', 'min:0'],
            'orders.*.parent_id' => ['nullable', 'integer', 'exists:menu_categories,id'],
        ]);

        $this->categoryService->updateOrder($request->orders);

        return response()->json([
            'success' => true,
            'message' => 'Порядок категорий обновлён',
        ]);
    }

    /**
     * GET /api/admin/menu/categories/statuses - статусы активности
     */
    public function statuses(): JsonResponse
    {
        return response()->json([
            'success' => true,
            'data' => $this->categoryService->getActiveStatuses(),
        ]);
    }
}
