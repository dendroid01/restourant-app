<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\NewsRequest;
use App\Http\Resources\NewsListResource;
use App\Http\Resources\NewsResource;
use App\Services\NewsService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AdminNewsController extends Controller
{
    public function __construct(
        protected NewsService $newsService
    ) {}

    /**
     * GET /api/admin/news - список новостей
     */
    public function index(Request $request): JsonResponse
    {
        $filters = $request->only(['status', 'search', 'date_from', 'date_to', 'sort_by', 'sort_order']);
        $perPage = $request->get('per_page', 10);

        $news = $this->newsService->getPaginated($filters, $perPage);

        return response()->json([
            'success' => true,
            'data' => NewsListResource::collection($news),
            'meta' => [
                'current_page' => $news->currentPage(),
                'last_page' => $news->lastPage(),
                'per_page' => $news->perPage(),
                'total' => $news->total(),
            ],
            'stats' => $this->newsService->getStats(),
            'statuses' => $this->newsService->getStatuses(),
        ]);
    }

    /**
     * GET /api/admin/news/{id} - детальная новость
     */
    public function show(int $id): JsonResponse
    {
        $news = $this->newsService->findById($id);

        if (!$news) {
            return response()->json([
                'success' => false,
                'message' => 'Новость не найдена',
            ], 404);
        }

        return response()->json([
            'success' => true,
            'data' => new NewsResource($news),
        ]);
    }

    /**
     * POST /api/admin/news - создать новость
     */
    public function store(NewsRequest $request): JsonResponse
    {
        $data = $request->validated();
        $userId = $request->user()->id;

        $news = $this->newsService->create($data, $userId);

        return response()->json([
            'success' => true,
            'message' => 'Новость успешно создана',
            'data' => new NewsResource($news),
        ], 201);
    }

    /**
     * PUT /api/admin/news/{id} - обновить новость
     */
    public function update(NewsRequest $request, int $id): JsonResponse
    {
        $data = $request->validated();

        $news = $this->newsService->update($id, $data);

        if (!$news) {
            return response()->json([
                'success' => false,
                'message' => 'Новость не найдена',
            ], 404);
        }

        return response()->json([
            'success' => true,
            'message' => 'Новость успешно обновлена',
            'data' => new NewsResource($news),
        ]);
    }

    /**
     * DELETE /api/admin/news/{id} - удалить новость
     */
    public function destroy(int $id): JsonResponse
    {
        $deleted = $this->newsService->delete($id);

        if (!$deleted) {
            return response()->json([
                'success' => false,
                'message' => 'Новость не найдена',
            ], 404);
        }

        return response()->json([
            'success' => true,
            'message' => 'Новость успешно удалена',
        ]);
    }

    /**
     * GET /api/admin/news/statuses - список статусов
     */
    public function statuses(): JsonResponse
    {
        return response()->json([
            'success' => true,
            'data' => $this->newsService->getStatuses(),
        ]);
    }
}
