<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\ManagerRequest;
use App\Http\Resources\ManagerResource;
use App\Services\ManagerService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AdminManagerController extends Controller
{
    public function __construct(
        protected ManagerService $managerService
    ) {}

    /**
     * GET /api/admin/managers - список менеджеров
     */
    public function index(Request $request): JsonResponse
    {
        $filters = $request->only(['is_active', 'search', 'sort_by', 'sort_order']);
        $perPage = $request->get('per_page', 10);

        $managers = $this->managerService->getPaginated($filters, $perPage);

        return response()->json([
            'success' => true,
            'data' => ManagerResource::collection($managers),
            'meta' => [
                'current_page' => $managers->currentPage(),
                'last_page' => $managers->lastPage(),
                'per_page' => $managers->perPage(),
                'total' => $managers->total(),
            ],
            'stats' => $this->managerService->getStats(),
            'statuses' => $this->managerService->getStatuses(),
            'available_sections' => $this->managerService->getAvailableSections(),
        ]);
    }

    /**
     * GET /api/admin/managers/{id} - детально
     */
    public function show(int $id): JsonResponse
    {
        $manager = $this->managerService->findById($id);

        if (!$manager) {
            return response()->json([
                'success' => false,
                'message' => 'Менеджер не найден',
            ], 404);
        }

        return response()->json([
            'success' => true,
            'data' => new ManagerResource($manager),
        ]);
    }

    /**
     * POST /api/admin/managers - создать менеджера
     */
    public function store(ManagerRequest $request): JsonResponse
    {
        $data = $request->validated();
        $manager = $this->managerService->create($data);

        return response()->json([
            'success' => true,
            'message' => 'Менеджер успешно создан',
            'data' => new ManagerResource($manager),
        ], 201);
    }

    /**
     * PUT /api/admin/managers/{id} - обновить менеджера
     */
    public function update(ManagerRequest $request, int $id): JsonResponse
    {
        $data = $request->validated();
        $manager = $this->managerService->update($id, $data);

        if (!$manager) {
            return response()->json([
                'success' => false,
                'message' => 'Менеджер не найден',
            ], 404);
        }

        return response()->json([
            'success' => true,
            'message' => 'Менеджер успешно обновлён',
            'data' => new ManagerResource($manager),
        ]);
    }

    /**
     * DELETE /api/admin/managers/{id} - удалить менеджера
     */
    public function destroy(int $id): JsonResponse
    {
        try {
            $deleted = $this->managerService->delete($id);

            if (!$deleted) {
                return response()->json([
                    'success' => false,
                    'message' => 'Менеджер не найден',
                ], 404);
            }

            return response()->json([
                'success' => true,
                'message' => 'Менеджер успешно удалён',
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], 422);
        }
    }

    /**
     * PATCH /api/admin/managers/{id}/block - заблокировать/разблокировать
     */
    public function toggleBlock(int $id): JsonResponse
    {
        try {
            $manager = $this->managerService->toggleBlock($id);

            if (!$manager) {
                return response()->json([
                    'success' => false,
                    'message' => 'Менеджер не найден',
                ], 404);
            }

            $message = $manager->is_active ? 'Менеджер разблокирован' : 'Менеджер заблокирован';

            return response()->json([
                'success' => true,
                'message' => $message,
                'data' => new ManagerResource($manager),
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], 422);
        }
    }

    /**
     * GET /api/admin/managers/stats - статистика
     */
    public function stats(): JsonResponse
    {
        return response()->json([
            'success' => true,
            'data' => $this->managerService->getStats(),
        ]);
    }

    /**
     * GET /api/admin/managers/sections - доступные разделы
     */
    public function sections(): JsonResponse
    {
        return response()->json([
            'success' => true,
            'data' => $this->managerService->getAvailableSections(),
        ]);
    }
}
