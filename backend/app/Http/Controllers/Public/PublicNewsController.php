<?php

namespace App\Http\Controllers\Public;

use App\Http\Controllers\Controller;
use App\Http\Resources\Public\PublicNewsDetailResource;
use App\Http\Resources\Public\PublicNewsListResource;
use App\Services\NewsService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class PublicNewsController extends Controller
{
    public function __construct(
        protected NewsService $newsService
    ) {}

    /**
     * GET /api/news - список новостей с пагинацией
     */
    public function index(Request $request): JsonResponse
    {
        $perPage = $request->get('per_page', 9);
        $filters = $request->only(['year', 'month', 'search']);

        $result = $this->newsService->getPublishedNews($perPage, $filters);

        return response()->json([
            'success' => true,
            'data' => PublicNewsListResource::collection($result['data']),
            'meta' => $result['meta'],
        ]);
    }

    /**
     * GET /api/news/latest - последние новости (для главной)
     */
    public function latest(Request $request): JsonResponse
    {
        $limit = $request->get('limit', 3);
        $news = $this->newsService->getLatestNews($limit);

        return response()->json([
            'success' => true,
            'data' => PublicNewsListResource::collection($news),
        ]);
    }

    /**
     * GET /api/news/archive - архив по годам и месяцам
     */
    public function archive(): JsonResponse
    {
        $archive = $this->newsService->getArchive();

        return response()->json([
            'success' => true,
            'data' => $archive,
        ]);
    }

    /**
     * GET /api/news/{id} - детальная новость
     */
    public function show(int $id): JsonResponse
    {
        $news = $this->newsService->getPublishedNewsById($id);

        if (!$news) {
            return response()->json([
                'success' => false,
                'message' => 'Новость не найдена',
            ], 404);
        }

        return response()->json([
            'success' => true,
            'data' => new PublicNewsDetailResource($news),
        ]);
    }
}
